import type { APIGatewayProxyHandler, APIGatewayProxyEvent } from "aws-lambda";
import { EventBridge } from "@aws-sdk/client-eventbridge";
import axios from 'axios';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';
import { env } from "$amplify/env/update-interval";

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const eventbridge = new EventBridge({ region: "us-east-1" });

interface CustomAPIGatewayProxyEvent extends APIGatewayProxyEvent {
  arguments: {
    interval: string;
  };
}

interface EventBridgeEvent extends APIGatewayProxyEvent {
  source: string;
  // Add other properties you expect from the EventBridge event
}

export const handler: APIGatewayProxyHandler = async (event, context) => { 
  console.log('Event:', event);
  // Check if this is an EventBridge scheduled event
  if ((event as EventBridgeEvent).source === 'aws.events') {
    // This is a scheduled event, perform scraping
    return handleScraping();
  }

  // This is an API request to set up the schedule
  const customEvent = event as CustomAPIGatewayProxyEvent;
  if (!customEvent.arguments.interval) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: JSON.stringify(event) }),
    };
  }

  const { interval } = customEvent.arguments;
  let scheduleExpression: string;

  // Convert interval to EventBridge schedule expression
  switch (interval) {
    case 'every minute':
      scheduleExpression = 'rate(1 minute)';
      break;
    case 'every three minutes':
      scheduleExpression = 'rate(3 minutes)';
      break;
    case 'hourly':
      scheduleExpression = 'rate(1 hour)';
      break;
    case 'daily':
      scheduleExpression = 'rate(1 day)';
      break;
    case 'weekly':
      scheduleExpression = 'rate(7 days)';
      break;
    default:
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid interval' }),
      };
  }

  try {
    // Delete existing rule if it exists
    try {
      await eventbridge.deleteRule({
        Name: 'WebScraperSchedule',
      });
    } catch (error) {
      // Ignore error if rule doesn't exist
    }

    // Create new EventBridge rule
    await eventbridge.putRule({
      Name: 'WebScraperSchedule',
      ScheduleExpression: scheduleExpression,
      State: 'ENABLED',
      Description: `Schedule for web scraping every ${interval}`,
    });

    // Add target to the rule (this Lambda function)
    await eventbridge.putTargets({
      Rule: 'WebScraperSchedule',
      Targets: [
        {
          Id: 'ScraperFunction',
          Arn: context.invokedFunctionArn,
        },
      ],
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Schedule set to ${interval}` }),
    };
  } catch (error) {
    console.error('Error setting up EventBridge schedule:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error setting up schedule' }),
    };
  }
};

// Helper function to handle the scraping logic
async function handleScraping() {
  console.log('Scraping job running at:', new Date().toISOString());
  
  try {
    const response = await axios.get('http://books.toscrape.com/catalogue/category/books_1/index.html');
    const $ = cheerio.load(response.data);
    const books: { title: string; price: string }[] = [];

    // Scrape all books
    $('.product_pod').each((index, element) => {
        const title = $(element).find('h3 a').attr('title') || '';
        const price = $(element).find('.price_color').text() || '';
        books.push({ title, price });
    });

    // Select a random book
    const randomBook = books[Math.floor(Math.random() * books.length)];

    const { data, error } = await supabase
      .from('books')
      .insert([randomBook]);

    if (error) {
      console.error('Error inserting books into Supabase:', error);
    } else {
      console.log('Books inserted into Supabase:', data);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Scraping completed successfully' }),
    };
  } catch (error) {
    console.error('Error scraping the website:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error during scraping' }),
    };
  }
}