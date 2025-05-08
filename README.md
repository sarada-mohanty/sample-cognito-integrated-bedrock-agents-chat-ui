# Guidance for Browser Client for Amazon Bedrock Agents

## Table of Contents
-[Overview](#overview) 
- 💰 [Cost](#cost) 
- ✅ [Prerequisites](#prerequisites)
- 🚀 [Deployment Steps](#deployment-steps)
- 🔍 [Deployment Validation](#deployment-validation)
- 📘 [Running the Guidance](#running-the-guidance)
- ➡️ [Next Steps](#next-steps)
- 🧹 [Cleanup](#cleanup)
- ❓ [FAQ, Known Issues, Additional Considerations, and Limitations](#faq-known-issues-additional-considerations-and-limitations)
- 📝 [Revisions](#revisions)
- ⚠️ [Notices](#notices)
- 👥 [Authors](#authors)

## 📋 Overview

A browser-based chat application built with React that connects directly to [Amazon Bedrock Agents](https://docs.aws.amazon.com/bedrock/latest/userguide/agents-how.html). The solution leverages [AWS Amplify] (https://docs.aws.amazon.com/amplify/) for hosting and deployment, while implementing secure access through [Amazon Cognito](https://docs.aws.amazon.com/cognito/)'s User and Identity Pools for temporary credential management and API authentication.

### Architecture Overview

![AWSReferenceArchitecture-SecureChatUI](https://github.com/user-attachments/assets/332a0da8-e87b-4661-adb9-e596aa070883)

### Demo

https://github.com/user-attachments/assets/83c4f1c9-9495-4d9c-a323-2e8bbf484523

### High-Level Steps:

1. The user navigates to the Secure Chat UI URL, which is hosted on AWS Amplify
2. The page is returned with HTML, CSS, JavaScript.  User is now able to input the configuration details for Amazon Cognito and Amazon Bedrock Agents
3. Upon configuration completion, the user is prompted to authenticate using Amazon Cognito with a username and password configured for them in the user pool
4. After successful authentication, Cognito Identity Pool will negotiate temporary credentials from AWS Simple Token Service (STS)
5. Cognito Identity Pool passes temporary AWS credentials to the frontend
6. Once authenticated, the user now sees the Secure Chat UI chat prompt to interact with the Amazon Bedrock Agent that is configured


## 💰 Cost

You are responsible for the cost of the AWS services used while running this Guidance.  

As of May 2025, the cost for running this Guidance with the default settings in the US East (N. Virginia) Region is approximately **$8.65** per month for serving up to 300 daily active users and hourly summarization by 5 developers.

We recommend creating a [Budget](https://console.aws.amazon.com/billing/home#/budgets) through AWS Cost Explorer to help manage costs. Prices are subject to change. For full details, refer to the pricing webpage for each AWS service used in this Guidance.

### Sample Cost Table

| AWS Service      | Dimensions                                                                 | Cost (USD)     |
|------------------|-----------------------------------------------------------------------------|----------------|
| Amazon Cognito   | 1,000 active users per month without advanced security feature              | $0.00/month    |
| AWS Amplify      | 5 developers committing code twice a day + 300 daily active users           | $8.00/month    |
| Amazon Bedrock   | 5 developers summarizing 2K to 1K output tokens hourly using Amazon Nova Lite       | $0.65/month    |

## ✅ Prerequisites

**Development Tools**
- Node.js v18+
- Latest npm version

**AWS Account Requirements**
- Access to the following services:
   - AWS Amplify (for hosting and deployment)
   - Amazon Bedrock Agents (for AI functionality)
   - Amazon Cognito (for authentication)

- IAM permissions to:
   - Configure and manage Bedrock Agents
   - Set up Cognito user/identity pools
   - Deploy Amplify applications

Note: Ensure your AWS account has sufficient permissions before starting the deployment process.

## 🚀 Deployment Steps

### Clone repository

1. Clone repository to your local machine

```bash
git clone https://github.com/aws-samples/sample-cognito-integrated-bedrock-agents-chat-ui.git
```

2. Change directory to the folder 
```bash
cd sample-cognito-integrated-bedrock-agents-chat-ui
```

3. Install dependencies 
```bash
npm install
```

### Local testing before deploying to AWS Amplify

1. Start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:5173 so you can test it locally before deploying to AWS Amplify 

### Manual deployment to AWS Amplify

For deploying to AWS Amplify, follow these steps:

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

Set up Amazon Bedrock Agent
- [Create](https://docs.aws.amazon.com/bedrock/latest/userguide/agents-create.html) and configure your Bedrock Agent in the AWS Console
- Note down the Agent ID and other relevant configuration [details](https://docs.aws.amazon.com/bedrock/latest/userguide/agents-view.html)
- To test this solution with a sample agent, you can leverage the Virtual Meterologist Agent CloudFormation template located [here](https://github.com/aws-samples/virtual-meteorologist-using-amazon-bedrock-agents/blob/main/cfn-virtual-meteorologist-using-amazon-bedrock-agents.yaml)

## 🔍 Deployment Validation

- Confirm that the Amplify app is deployed by checking the Amplify Console.
- Verify that the Bedrock Agent responds to input on the UI.
- You should see the frontend render an interactive chat interface.

## 📘 Running the Guidance

1. Launch the app (locally or via Amplify).
2. Log in via Cognito.
3. Enter a prompt into the chat input.
4. Observe the response generated by the Bedrock Agent.

### Expected Output

- You will see a conversational response in the chat UI rendered by the React app.
- All requests go securely through Amplify using temporary credentials.

## ➡️ Next Steps

This implementation leverages AWS Cloudscape Design System components to create a consistent and professional user interface aligned with AWS design patterns. For future enhancements, you can also take advantage of Amplify Gen2's chat capabilities, which would allow you to seamlessly integrate interactive chat features while maintaining the same AWS-native look and feel. The addition of Amplify Gen2 chat components would complement the existing Cloudscape foundation, particularly in areas requiring real-time user interaction and support.

## 🧹 Cleanup

1. **Delete Amplify app**  
   - From AWS Amplify Console, delete the app.

2. **Delete Cognito pools**  
   - Remove both User and Identity Pools.

3. **Delete Bedrock Agent**  
   - Navigate to the Bedrock console and delete the created agent.

4. **Optional:** Delete associated IAM roles and policies.

## ❓ FAQ, Known Issues, Additional Considerations, and Limitations

### Known Issues

- Some browsers may block third-party cookies, which may affect login behavior.

### Additional Considerations

- Amazon Bedrock requests are charged per token.

For issues or feature requests, please use the [GitHub Issues tab](https://github.com/aws-samples/browser-client-bedrock-agents/issues).

## 📝 Revisions

- **v1.0.0** – Initial release with Bedrock Agent integration and Amplify deployment support.

## ⚠️ Notices

Customers are responsible for making their own independent assessment of the information in this Guidance.  
This Guidance:  
(a) is for informational purposes only,  
(b) represents AWS current product offerings and practices, which are subject to change without notice, and  
(c) does not create any commitments or assurances from AWS and its affiliates, suppliers, or licensors.  

AWS products or services are provided “as is” without warranties, representations, or conditions of any kind, whether express or implied.  
AWS responsibilities and liabilities to its customers are controlled by AWS agreements, and this Guidance is not part of, nor does it modify, any agreement between AWS and its customers.

## 👥 Authors
- Sergio Barraza
- Salman Ahmed
- Ravi Kumar
- Ankush Goyal  
