# Daily Focus Todo App

A modern, full-stack Todo application built with Next.js, featuring authentication, task management, and a beautiful UI.

## Features

- 🔐 User Authentication (Register/Login)
- ✅ Task Management (Create, Read, Update, Delete)
- 🔍 Real-time Search with Debouncing
- 📱 Responsive Design
- 🎨 Modern UI with Tailwind CSS
- 🔄 State Management with React Query
- 🍪 Secure Authentication with JWT
- 📝 Form Validation with Yup
- ⚡ Optimized Performance

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query
- **Form Handling**: React Hook Form, Yup
- **Authentication**: JWT with Cookies
- **Font**: Geist (Vercel's custom font)

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd daily-focus-todo-app-next
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory and add:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── dashboard/      # Dashboard page
│   ├── login/         # Login page
│   └── register/      # Registration page
├── components/         # Reusable components
├── contexts/          # React contexts
├── hooks/             # Custom hooks
├── services/          # API services
└── types/             # TypeScript types
```

## Features in Detail

### Authentication
- Secure user registration and login
- JWT-based authentication
- Protected routes
- Automatic token management

### Task Management
- Create new tasks with title and optional description
- Mark tasks as complete/incomplete
- Delete tasks
- Real-time updates
- Pagination support

### Search
- Real-time task search
- Debounced API calls
- Instant results

### UI/UX
- Clean and modern interface
- Responsive design
- Loading states
- Error handling
- Toast notifications
- Form validation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
