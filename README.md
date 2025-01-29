# Browser Client for Amazon Bedrock Agents

A React-based web application that enables interaction with Amazon Bedrock Agents directly from the browser. The application uses AWS Amplify, and leverages temporary credentials from Amazon Cognito User and Identity Pools for secure API access.

## Prerequisites

- Node.js (v18 or later recommended)
- npm (latest version)
- AWS Account with access to:
  - Amazon Bedrock
  - Amazon Cognito
  - IAM permissions to manage Bedrock and Cognito resources
  - AWS Amplify (optional - only if using Amplify for deployment)

## AWS Setup (Optional - Only if using AWS Amplify)

If you plan to use AWS Amplify for deployment, follow these steps:

1. Configure AWS Amplify

```bash
# Install Amplify CLI globally
npm install -g @aws-amplify/cli

# Configure Amplify CLI with your AWS credentials
amplify configure

# Initialize Amplify in your project
amplify init

# Push the backend resources to AWS
amplify push
```

2. Set up Amazon Bedrock Agent
- Create and configure your Bedrock Agent in the AWS Console
- Note down the Agent ID and other relevant configuration details

## Local Development

1. Install dependencies:

```bash
npm install
```


2. Start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:5173

## Building for Production

1. Build the application:

```bash
npm run build
```

2. Test the production build locally:

```bash
npm run preview
```

## Deployment to AWS Amplify

### Option 1: Manual Deployment
1. Build the application:

```bash
npm run build
```

2. Package the dist folder contents:

```bash
cd dist
zip -r ../deployment.zip ./*
```

3. Upload the deployment.zip file through the AWS Amplify Console

### Option 2: Continuous Deployment
1. Connect your repository to AWS Amplify:
   - Go to AWS Amplify Console
   - Click "New App" > "Host Web App"
   - Choose your repository provider
   - Follow the setup wizard

2. Amplify will automatically build and deploy your application when you push changes to your repository

## Additional Resources

- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [Amazon Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [Vite Documentation](https://vitejs.dev/guide/)

## Support

For issues and feature requests, please file an issue in the repository.