
import { Construct } from "@aws-cdk/core";
import { ICertificate, Certificate as Cert } from "@aws-cdk/aws-certificatemanager";

export interface CertificateProps {
    domain?: string,
    certificateArn?: string,
}

export default class Certificate extends Construct {
    public readonly certificate: ICertificate;

  constructor(scope: Construct, id: string, props: CertificateProps) {
    super(scope, id);

    const { 
      domain,
      certificateArn
    } = props;

    if (domain){
        this.certificate = new Cert(this, "Certificate", {
          domainName:  domain,
          subjectAlternativeNames: [
            `*.${domain}`,
            // Can always add more here.
          ]
        });
      }
      else if (certificateArn){
        this.certificate = Cert.fromCertificateArn(this, "Certificate", certificateArn);
      }
      else {
        throw('A certificateArn or domain are required');
      }

  }
}
