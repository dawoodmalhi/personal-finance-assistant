# Personal Finance Assistant

An AI-powered personal finance tracking application that helps you manage budgets, track transactions, and gain insights into your spending habits. Built with an integrated Claude AI assistant that remembers your preferences, proactively alerts you about budgets, and helps you navigate your financial data.

## Features

- **Smart Dashboard:** Visualize your cash flow, income, and expenses with interactive charts.
- **Transaction Management:** Import transactions via CSV or sync securely with a mock bank API.
- **Automated Budgets:** Set monthly or weekly limits by category. Track spending in real-time with visual progress bars and warnings.
- **AI Financial Assistant:** Chat with Claude to analyze your spending, create new budgets on the fly, and ask financial questions.
- **Persistent AI Memory:** The assistant silently learns your preferences, pay dates, and financial goals in the background to provide highly personalized advice.
- **Secure Authentication:** User management and secure routing handled by Clerk.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS & Shadcn UI
- **Database:** PostgreSQL (hosted on [Supabase](https://supabase.com/))
- **ORM:** [Prisma](https://www.prisma.io/)
- **Authentication:** [Clerk](https://clerk.com/)
- **AI Integration:** [Anthropic SDK](https://docs.anthropic.com/) (Claude 3.5 Models)

---

## Prerequisites

Before you begin, ensure you have the following accounts and tools set up:
- [Node.js](https://nodejs.org/) installed on your machine.
- A [Supabase](https://supabase.com/) account for the PostgreSQL database.
- A [Clerk](https://clerk.com/) account for authentication.
- An [Anthropic](https://console.anthropic.com/) account for the AI API key.

---

## Getting Started

Follow these steps to set up the project locally:

1. **Clone the repository:**
```bash
   git clone https://github.com/dawoodmalhi/personal-finance-assistant.git
```

2. **Navigate to the project directory:**
```bash
   cd personal-finance-assistant
```

3. **Set up environment variables:**
Create a .env file in the root of your project. Use the provided .env.example as a template or add the following keys:

4. **Install the dependencies:**
```bash
   npm install
```

5. **Set up Supabase:**
Ensure your Supabase direct connection URL is correctly placed in your .env file. Verify the connection by running the built-in database check script:
```bash
   npm run check-db
```

6. **Set up Clerk Authentication:**
Configure your Clerk project. Note for production: You must set up a Clerk Webhook to automatically sync new user sign-ups with your Supabase database using the WEBHOOK_SECRET.
```bash
   npm run check-db
```

7. **Generate the Prisma client:**
```bash
   npm run prisma:generate
```

8. **Run database migrations:**
Push the database schema to Supabase to create your tables:
```bash
   npm run prisma:migrate
```

9. **Configure and run the database seed:**
Open the prisma/seed.ts file and update the mock user with a valid email address that exists in both your Clerk and Supabase dashboards. Then, populate your database:
```bash
   npm run prisma:seed
```
Note: For seeding the chat agent their is also a file (prisma/seedChats.ts), you can use that if needed.

10. **Run the development server:**
Push the database schema to Supabase to create your tables:
```bash
  npm run dev
```

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.
