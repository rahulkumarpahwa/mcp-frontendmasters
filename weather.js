// we will create the weather mcp server, which the will take the latitude and longitude as input and give us the temp as output.
// so import the package 'npm i openmeteo@1.2.0', which i used to get the weather from sdk.

import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { fetchWeatherApi } from "openmeteo";
import { z } from "zod";

// Create an MCP server
const server = new McpServer({
  name: "weather-server",
  version: "1.0.0",
});

// Add a weather tool
server.registerTool(
  "get_weather",
  {
    title: "Get Current Weather",
    description: "Get current weather data for a given latitude and longitude",
    inputSchema: {
      latitude: z.number().describe("Latitude coordinate"),
      longitude: z.number().describe("Longitude coordinate"),
    },
  },
  async ({ latitude, longitude }) => {
    try {
      const params = {
        latitude,
        longitude,
        current: [
          "temperature_2m",
          "relative_humidity_2m",
          "apparent_temperature",
          "is_day",
          "precipitation",
          "rain",
          "wind_speed_10m",
        ],
        wind_speed_unit: "mph",
        temperature_unit: "fahrenheit",
        precipitation_unit: "inch",
      };

      const url = "https://api.open-meteo.com/v1/forecast";
      const responses = await fetchWeatherApi(url, params);

      // Process first location
      const response = responses[0];

      const current = response.current();

      // Note: The order of weather variables in the URL query and the indices below need to match
      const weatherData = {
        temperature2m: current.variables(0).value(),
        relativeHumidity2m: current.variables(1).value(),
        apparentTemperature: current.variables(2).value(),
        isDay: current.variables(3).value() === 1,
        precipitation: current.variables(4).value(),
        rain: current.variables(5).value(),
        windSpeed10m: current.variables(6).value(),
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(weatherData, null, 2),
          },
        ],
        structuredOutput: {
          temperature: {
            current: current.variables(0).value(),
            feelsLike: current.variables(2).value(),
            unit: "fahrenheit",
          },
          humidity: {
            value: current.variables(1).value(),
            unit: "percent",
          },
          wind: {
            speed: current.variables(6).value(),
            unit: "mph",
          },
          precipitation: {
            total: current.variables(4).value(),
            rain: current.variables(5).value(),
            unit: "inches",
          },
          conditions: {
            isDay: current.variables(3).value() === 1,
            dayNight: current.variables(3).value() === 1 ? "day" : "night",
          },
        },
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error fetching weather data: ${error.message}`,
          },
        ],
      };
    }
  },
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
