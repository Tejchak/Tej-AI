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

Replace 'AAPL' with any stock symbol and adjust the days variable as needed.`,
    fallbackOnly: true  // Now this will only be used when the API fails
  },
  {
    query: "Should I invest in Meta",
    response: `Investment Analysis for Meta Platforms, Inc. (META)

Financial Overview
• Market Cap: $1.82 trillion
• 52-Week Range: $414.50 - $725.01
• 52-Week Change: +55.92%
• Earnings Growth: 37.4%
• Revenue Growth: 19.9%
• Profit Margin: 35.55%
• Operating Margin: 42.76%
• Beta: 1.215 (indicating higher volatility compared to the market)
• Dividend Yield: 0.3% (with a dividend rate of $2.00)

Analyst Recommendations
• Recommendation Key: Buy
• Mean Target Price: $757.69
• Analyst Opinions: 58 analysts have provided opinions, indicating a generally positive outlook.

Company Overview
Meta Platforms, Inc., formerly known as Facebook, Inc., is a leading technology conglomerate based in Menlo Park, California. The company operates major platforms such as Facebook, Instagram, WhatsApp, and Threads. Advertising constitutes 97.5% of its revenue. In 2021, the company rebranded to reflect its focus on building the metaverse, an integrated environment linking its various products and services.

Meta is recognized as one of the largest American IT companies, alongside giants like Google, Amazon, Apple, and Microsoft. The company has made significant investments in research and development, spending approximately $35.3 billion in 2022.

Legal Considerations
Meta is currently involved in ongoing antitrust litigation with the Federal Trade Commission (FTC), which alleges that the company has engaged in anti-competitive practices through its acquisitions of Instagram and WhatsApp. This legal situation could impact investor sentiment and stock performance.

Conclusion
Based on the financial data and analyst recommendations, investing in Meta Platforms, Inc. appears to be a favorable option, especially considering its strong earnings and revenue growth, as well as a positive analyst outlook. However, potential investors should also consider the ongoing legal challenges that could affect the company's future performance.

Recommendation: If you are comfortable with the associated risks, particularly regarding legal issues, investing in Meta could be a good opportunity given its growth potential and market position.`,
    fallbackOnly: true
  }
  // Add more predefined responses here as requested
];
