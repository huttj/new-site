# Training 2


## Introduction

Today's main focus will be on AWS Lambda.

### (Re-)Introduction to AWS Managed Services

| Service     | Description
|-------------|---------------------------------------------
| DynamoDB    | NoSQL store with predictable performance
| API Gateway | HTTPS interface for AWS resources
| SNS / SQS   | Inter-service messaging and message queues
| S3 and KMS  | Blob storage and key-management
| IAM         | Role-based access control
| CloudWatch  | Logs and metrics for AWS
| Slack*       | 

**Note:** Slack is not an AWS managed service. It is, however, useful when combined with AWS Lambda.

### Walkthroughs

- Getting Started
- DynamoDB trigger & Lambda
- SQS Polling
- CloudWatch
- S3 and KMS

### Roadmap

  1. Initial construction and constraints
  2. Ongoing development
     - How do we add another channel?
     - How do we add more properties to an object?
     - New (simpler) Lambda build process & async functions



## (Re-)Introduction to AWS Managed Services

### Setup Scripts
  - Use Boto3 (Python SDK)
  - AWS CLI also use Python under the covers
  - Environment-based (prefix)
  - Aim is to be able to set up and tear down an env without much fuss
  - Main alternative is CloudFormation, but it's slightly less accessible

### DynamoDB
  - Key-Value store
  - Distributed
  - "Tunable" capacity
  - Local Indexes and GSIs

### Lambda
  - Can be triggered programmatically, based on many different types of events
  - Supports Node, Java, and Python
    - Recently released a Node v4 environment
  - Can run everything from NPM
  - Not currently using any external dependencies except for the AWS SDK and one code snippet (polyfill)

### SNS / SQS
  - Can take as many messages as you can throw at it
  - Connects nearly every AWS managed service, as well as apps, through the SDK
  - SQS can store messages for later processing



## Walkthroughs

### Getting Started
  1. Set credentials file
  2. Download CLI or SDK
  3. Connect!

### DynamoDB trigger & Lambda
  - New DynamoDB table
  - New Lambda
      - Build Lambda(s)
      - Write and build
  - Post to Slack

### SQS Polling
  - New SQS queue
  - New lambda
  - New API gateway endpoint

### CloudWatch

### S3 and KMS
  - Create new bucket
  - Upload file
  - Add KMS key



## Roadmap

### Initial Construction

#### Constraints
  - Lambda was still using Node v0.10
    - Needed polyfill for promises
    - Babel to transpile from ES6 to ES5
  - Started with JobOrder pipeline
    - Summarized some properties with IDs
    - Made table with just two indexes, no sort keys (not the best for more complex queries)
  - Namespacing with prefixes


### Ongoing development

#### Adding another channel/pipeline
  - Copy JobOrder lambda, modify names and resources, as needed
  - Add new entry to endpoints
  - Update build scripts to include new lambda, SQS queue, etc.
  - Deploy and test

#### Adding more properties to an object
  - Good news! The lambdas just pass through the data, so the only changes required are to the triggers, stored procs, and Windows Services

#### New, simpler lambdas, with async functions
  - The latest version of JavaScript supports a coroutine-like construct through generators
  - This can be achieved with [TJ Holowaychuk's simple "Co" library](https://github.com/tj/co) (MIT License)

The syntax goes from this:

    function doAsync(param) {
        return firstAsyncFunction(param)
            .then(result => {
                return otherFunction(param, result).then(otherResult => {
                    return { result, otherResult };
                });
            })
            .then(secondAsyncFunction);
    }
    
to this:

    function doAsync*(param) {
        const result      = yield firstAsyncFunction(param);
        const otherResult = yield otherFunction(param, result);
        return secondAsyncFunction({ result, otherResult });
    }
    
This makes the code much easier to read and write.
