# Table of Contents
- [Browser Client for Amazon Bedrock Agents](#browser-client-for-amazon-bedrock-agents)
  - [UI main components](#ui-main-components)
    - [Application configuration form](#application-configuration-form)
    - [Login process](#login-process)
    - [Chat interaction](#chat-interaction)
- [Prerequisites](#prerequisites)
- [AWS Setup (Optional - Only if using AWS Amplify)](#aws-setup-optional---only-if-using-aws-amplify)
- [Local Development](#local-development)
- [Building for Production](#building-for-production)
- [Deployment to AWS Amplify](#deployment-to-aws-amplify)
  - [Option 1: Manual Deployment](#option-1-manual-deployment)
  - [Option 2: Continuous Deployment](#option-2-continuous-deployment)
- [Sample Cost Analysis](#sample-cost-analysis)
- [Additional Resources](#additional-resources)
- [Support](#support)


# Browser Client for Amazon Bedrock Agents

A React-based web application that enables interaction with Amazon Bedrock Agents directly from the browser. The application uses AWS Amplify, and leverages temporary credentials from Amazon Cognito User and Identity Pools for secure API access.

## UI main components

### Application configuration form
![410521698-6d60dcf5-3fbe-4d5e-a201-9ee1d22958c0](https://github.com/user-attachments/assets/a2421c88-6fb4-45d8-9deb-7146d1ffad97)

### Login process
![login](https://github.com/user-attachments/assets/c563e4d6-f17f-4699-9055-be88dcb11c69)

### Chat interaction
![chatprompt](https://github.com/user-attachments/assets/6ea57a4d-503a-4936-a2c4-a7d0c8b2b8a5)



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

## Sample Cost Analysis
The following table provides a sample cost breakdown for deploying this Guidance with the default parameters in the US East (N. Virginia) Region for one month:
| AWS Service | Dimensions | Cost (USD) |
|----------|----------| ----------|
| Amazon Cognito | 1,000 active users per month without advanced security feature | $0.00/month |
| AWS Amplify | 5 developers committing code twice a day and 300 daily active users, the estimated monthly Amplify cost—including build, deploy, and hosting | $8.00/month |
| Amazon Bedrock | 5 developers summarizing 2K tokens to 1K output tokens hourly using Amazon Nova Lite | $0.65/month |




## Additional Resources

- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [Amazon Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [Vite Documentation](https://vitejs.dev/guide/)

## Support

For issues and feature requests, please file an issue in the repository.
