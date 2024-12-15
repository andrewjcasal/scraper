import type { APIGatewayProxyHandler } from "aws-lambda";
import cron from "node-cron";

let currentJob: cron.ScheduledTask | null = null;

export const handler: APIGatewayProxyHandler = async (event) => {

  
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing request body' }),
    };
  }

  const { interval } = JSON.parse(event.body);
  let cronExpression: string;

  // Define the cron expression based on the selected interval
  switch (interval) {
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
  currentJob = cron.schedule(cronExpression, () => {
    console.log('Scraping job running...');
    // Insert scraping logic here
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ message: `Interval set to ${interval}` }),
  };
};