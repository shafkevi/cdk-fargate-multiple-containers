import { Vpc } from "@aws-cdk/aws-ec2";
import { Construct, Stack, StackProps, CfnOutput } from "@aws-cdk/core";
import Certificate from "../constructs/Certificate";
import Fargate from "../constructs/Fargate";

export interface MultiContainerStackProps {
  domain?: string,
  certificateArn?: string,
}

export default class MultiContainer extends Stack {

  constructor(scope: Construct, id: string, props: MultiContainerStackProps) {
    super(scope, id);

    const {
      domain,
      certificateArn,
    } = props;

    const vpc = new Vpc(this, "Vpc", { maxAzs: 2});

    const { certificate } = new Certificate(this, "Certificate", {
      domain,
      certificateArn 
    });

    new Fargate(this, 'App', {
      vpc,
      certificate
    });

  }
}
