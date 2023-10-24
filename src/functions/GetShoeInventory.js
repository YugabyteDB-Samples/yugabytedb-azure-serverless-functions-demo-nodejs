const { app } = require("@azure/functions");
const { Client } = require("pg");

app.http("GetShoeInventory", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: async () => {
    // Read the PostgreSQL connection settings from local.settings.json
    console.log("process.env.DB_HOST:", process.env.DB_HOST);
    const client = new Client({
      user: process.env.DB_USERNAME,
      host: process.env.DB_HOST,
      database: "yugabyte",
      password: process.env.DB_PASSWORD,
      port: 5433,
      max: 10,
      idleTimeoutMillis: 0,
      ssl: {
        rejectUnauthorized: true,
        ca: atob(process.env.DB_CERTIFICATE),
        servername: process.env.DB_HOST,
      },
    });

    try {
      // Connect to the PostgreSQL database
      await client.connect();

      // Query YugabyteDB for shoe inventory
      const query =
        "SELECT i.quantity, s.model, s.brand from inventory i INNER JOIN shoes s on i.shoe_id = s.id;";
      const result = await client.query(query);

      // Process the query result
      const data = result.rows;

      // Close the database connection
      await client.end();

      return {
        status: 200,
        body: JSON.stringify(data),
      };
    } catch (error) {
      console.error("Error connecting to the database:", error);
      return {
        status: 500,
        body: "Internal Server Error",
      };
    }
  },
});
