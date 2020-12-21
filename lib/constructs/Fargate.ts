import path from "path";
import { IVpc } from "@aws-cdk/aws-ec2";
import { Construct, RemovalPolicy } from "@aws-cdk/core";
import { LogGroup, RetentionDays } from "@aws-cdk/aws-logs";
import { ICertificate } from "@aws-cdk/aws-certificatemanager";
import { 
  ApplicationLoadBalancer, 
  ListenerCondition, 
  ApplicationProtocol,
} from "@aws-cdk/aws-elasticloadbalancingv2";
import { 
  AwsLogDriver, 
  Cluster, 
  ContainerImage, 
  FargateTaskDefinition,
  FargateService,
  Protocol,
} from "@aws-cdk/aws-ecs";

export interface FargateProps {
  vpc: IVpc,
  certificate?: ICertificate,
}

export default class Fargate extends Construct {
  private assetPath = path.join(__dirname, "..", "..", "src", "ecs");

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

    const service = new FargateService(this, "FargateService", {
      cluster,
      taskDefinition,
      serviceName: "FargateService",
      desiredCount: 1,
    });


    const loadBalancer = new ApplicationLoadBalancer(this, "LoadBalancer", {
      vpc,
      internetFacing: true
    });


    const loadBalancerListener = loadBalancer
      .addListener("Listener", { 
        port: 443,
        certificates: certificate ? [certificate] : undefined,
      });

    loadBalancerListener 
      .addTargets("ApiTarget", {
        port: 8080, // api port
        targets: [service]
      });
    loadBalancerListener
      .addTargets("AppTarget", {
        port: 8081, // app port
        protocol: ApplicationProtocol.HTTP,
        conditions: [
          ListenerCondition.pathPatterns(['/app/*'])
        ],
        priority: 1,
        targets: [service.loadBalancerTarget({
          containerName: 'AppContainer',
          containerPort: 8081,
          protocol: Protocol.TCP
        })]
      });

  }
}
