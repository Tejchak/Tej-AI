/**
 * This file contains predefined responses for specific queries that should be cached.
 * Only add responses here that:
 * 1. Don't change over time (e.g., code examples, definitions)
 * 
 * DO NOT add responses that:
 * 1. Depend on real-time data (e.g., current stock prices)
 * 2. Need to be personalized for each user
 */

interface PredefinedResponse {
  query: string;
  response: string;
  fallbackOnly?: boolean; // If true, only use this response when the API fails
}

export const predefinedResponses: PredefinedResponse[] = [
  {
    query: "Write python code to calculate the x-day moving average for a given stock",
    response: `To calculate the x-day moving average for a given stock, you can use the following Python code:

\`\`\`python
import pandas as pd
import yfinance as yf

def calculate_moving_average(stock_symbol, days):
    # Fetch historical data for the stock
    stock_data = yf.download(stock_symbol, period='1y')  # Get 1 year of data
    
    # Calculate the moving average
    stock_data['Moving Average'] = stock_data['Close'].rolling(window=days).mean()
    
    return stock_data[['Close', 'Moving Average']]

# Example usage
stock_symbol = 'AAPL'  # Replace with your stock symbol
days = 20  # Replace with the number of days for the moving average
moving_average_data = calculate_moving_average(stock_symbol, days)
print(moving_average_data)
\`\`\`

This code:
1. Uses pandas for data manipulation and yfinance to fetch stock data
2. Retrieves the last year's worth of historical stock data
3. Computes the moving average of closing prices over the specified days
4. Returns a DataFrame with closing prices and moving average

Replace 'AAPL' with any stock symbol and adjust the days variable as needed.`
  },
  {
    query: "Should I invest in Meta",
    response: `Here's an analysis of Meta Platforms, Inc. (META) based on the latest financial data:

Financial Performance
Revenue: $156.23 billion
Net Income: $55.54 billion
Earnings Growth: 37.4% (year-over-year)
Profit Margin: 35.55%
Operating Margin: 42.77%
Return on Equity: 36.13%
Debt to Equity Ratio: 29.81 (indicating a moderate level of debt)

Analyst Recommendations
Recommendation: Buy
Target Mean Price: $757.69
Target High Price: $935.00
Target Low Price: $505.00

Dividends
Dividend Rate: $2.00
Dividend Yield: 0.30%

Summary
Meta Platforms, Inc. has shown strong financial performance with significant earnings growth and a solid profit margin. The stock has a "buy" recommendation from analysts, with a target mean price above the current price, suggesting potential for growth. However, the stock is also relatively volatile, as indicated by its beta value.

Conclusion
Based on the current financial data and analyst recommendations, investing in Meta could be a good opportunity, especially if you are looking for growth in the technology sector. However, consider your risk tolerance and investment strategy before making a decision.`,
    fallbackOnly: true // Only use this response when the API fails
  }
  // Add more predefined responses here as requested
];
