import path from "path";
import { IVpc } from "@aws-cdk/aws-ec2";
import { Construct, RemovalPolicy } from "@aws-cdk/core";
import { LogGroup, RetentionDays } from "@aws-cdk/aws-logs";
import { ICertificate } from "@aws-cdk/aws-certificatemanager";
import { 
  AwsLogDriver, 
  Cluster, 
  ContainerImage, 
  FargateTaskDefinition,
  FargateService,
} from "@aws-cdk/aws-ecs";

export interface FargateProps {
  vpc: IVpc,
  certificate?: ICertificate,
}

export default class Fargate extends Construct {
  private assetPath = path.join(__dirname, "..", "..", "src", "ecs");
  public readonly service: FargateService;

  constructor(scope: Construct, id: string, props: FargateProps) {
    super(scope, id);

    const { 
      vpc,
      certificate
    } = props;

    const cluster = new Cluster(this, "Cluster", {
      vpc,
      clusterName: "FargateCluster",
    });

    const taskDefinition = new FargateTaskDefinition(this, "TaskDefinition", {
      cpu: 512,
      memoryLimitMiB: 1024,
    });

    taskDefinition.addContainer("ApiContainer", {
      image: ContainerImage.fromAsset(path.join(this.assetPath, "api")),
      cpu: 256,
      memoryLimitMiB: 512,
      environment: {
        ENV_VAR: "This is the api",
        PORT: "8080",
        OTHER_HOST_PORT: "8081"
      },
      logging: new AwsLogDriver({
        streamPrefix: "api",
        logGroup: new LogGroup(this, "apiLogGroup", {
          logGroupName: '/aws/ecs/api',
          retention: RetentionDays.ONE_WEEK,
          removalPolicy: RemovalPolicy.DESTROY 
        })
      })
    })
    .addPortMappings({
      containerPort: 8080,
    });

    taskDefinition.addContainer("AppContainer", {
      image: ContainerImage.fromAsset(path.join(this.assetPath, "app")),
      cpu: 256,
      memoryLimitMiB: 512,
      environment: {
        ENV_VAR: "This is the app",
        PORT: "8081",
        OTHER_HOST_PORT: "8080",
      },
      logging: new AwsLogDriver({
        streamPrefix: "app",
        logGroup: new LogGroup(this, "appLogGroup", {
          logGroupName: '/aws/ecs/app',
          retention: RetentionDays.ONE_WEEK,
          removalPolicy: RemovalPolicy.DESTROY 
        })
      })
    })
    .addPortMappings({
      containerPort: 8081,
    });

    this.service = new FargateService(this, "FargateService", {
      cluster,
      taskDefinition,
      serviceName: `${id}Service`,
      desiredCount: 1,
    });

  }
}
