import path from "path";
import { IVpc } from "@aws-cdk/aws-ec2";
import { Construct, } from "@aws-cdk/core";
import { ICertificate } from "@aws-cdk/aws-certificatemanager";
import { 
  ApplicationLoadBalancer,
  AddApplicationTargetsProps,
  ApplicationListener,
} from "@aws-cdk/aws-elasticloadbalancingv2";

export interface LoadBalancerProps {
  vpc: IVpc,
  certificate?: ICertificate,
}

export default class LoadBalancer extends Construct {
  private assetPath = path.join(__dirname, "..", "..", "src", "ecs");
  private listener: ApplicationListener;
  private loadBalancer: ApplicationLoadBalancer;

  public addTarget(id: string, props: AddApplicationTargetsProps){
    this.listener.addTargets(id, props);
  };

  constructor(scope: Construct, id: string, props: LoadBalancerProps) {
    super(scope, id);

    const { 
      vpc,
      certificate
    } = props;

    this.loadBalancer = new ApplicationLoadBalancer(this, "LoadBalancer", {
      vpc,
      internetFacing: true
    });

    this.listener = this.loadBalancer
      .addListener("Listener", { 
        port: certificate ? 443 : 80,
        certificates: certificate ? [certificate] : undefined,
      });

  }
}