#!/usr/bin/env node
import "source-map-support/register";
import { App } from "@aws-cdk/core";
import MultiContainerStack from "../lib/stacks/MultiContainerStack";


const app = new App();

const props = {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.AWS_REGION ??
      process.env.CDK_DEPLOY_REGION ??
      process.env.CDK_DEFAULT_REGION ??
      "us-east-1"
  },
  domain: process.env.DOMAIN || undefined,
  certificateArn: process.env.CERTIFICATE_ARN || undefined,
};

new MultiContainerStack(app, "MultiContainers", props);
