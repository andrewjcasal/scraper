import type { APIGatewayProxyHandler, APIGatewayProxyEvent } from "aws-lambda";
import cron from "node-cron";
import axios from 'axios';
import cheerio from 'cheerio';

let currentJob: cron.ScheduledTask | null = null;
// Extend the APIGatewayProxyEvent type
interface CustomAPIGatewayProxyEvent extends APIGatewayProxyEvent {
  arguments: {
    interval: string;
  };
}

export const handler: APIGatewayProxyHandler = async (event) => { 
  const customEvent = event as CustomAPIGatewayProxyEvent;
  if (!customEvent.arguments.interval) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: JSON.stringify(event) }),
    };
  }

  const { interval } = JSON.parse(customEvent.arguments.interval);
  let cronExpression: string;

  // Define the cron expression based on the selected interval
  switch (interval) {
    case 'every minute':
      cronExpression = '* * * * *'; // Run every minute
      break;
    case 'every three minutes':
      cronExpression = '*/3 * * * *'; // Run every three minutes
      break;
    case 'hourly':
      cronExpression = '0 * * * *'; // Run at the top of every hour
      break;
    case 'daily':
      cronExpression = '0 0 * * *'; // Run once a day at midnight
      break;
    case 'weekly':
      cronExpression = '0 0 * * 0'; // Run once a week on Sunday at midnight
      break;
    default:
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid interval' }),
      };
  }

  // Cancel the existing cron job if it exists
  if (currentJob) {
    currentJob.stop();
  }

  // Schedule the new cron job
  currentJob = cron.schedule(cronExpression, async () => {
    console.log('Scraping job running...');
  
    try {
      const response = await axios.get('http://books.toscrape.com/'); // Example book website
      const html = response.data;
      const $ = cheerio.load(html);
  
      // Scrape book titles and prices
      const books: { title: string; price: string }[] = [];
      $('.product_pod').each((index, element) => {
        const title = $(element).find('h3 a').attr('title') || '';
        const price = $(element).find('.price_color').text() || '';
        books.push({ title, price });
      });
  
      console.log('Books scraped:', books);
    } catch (error) {
      console.error('Error scraping the website:', error);
    }
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ message: `Interval set to ${interval}` }),
  };
};