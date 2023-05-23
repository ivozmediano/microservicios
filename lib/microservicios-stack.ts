//Librerías utilizadas
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as path from 'path';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class MicroserviciosStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //Definición de la tabla Dynamodb
    const tablaRegistros = new dynamodb.Table(this, "TablaRegistros", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    //Definición de funciones lambda
    const nuevoRegistroFunction = new lambda.Function(this, "NuevoRegistroFunction", {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'handler.nuevoRegistro', //Método nuevoRegistro del archivo handler.js
      code: lambda.Code.fromAsset(path.resolve(__dirname, 'lambda')), //Directorio donde se encuentra el código (debe añadirse)
      environment: {
        TABLA_REGISTROS: tablaRegistros.tableName,
      },
    });

    const consultaRegistroFunction = new lambda.Function(this, "ConsultaRegistroFunction", {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'handler.consultaRegistro', //Método consultaRegistro del archivo handler.js
      code: lambda.Code.fromAsset(path.resolve(__dirname, 'lambda')), //Directorio donde se encuentra el código
      environment: {
        TABLA_REGISTROS: tablaRegistros.tableName,
      },
    });

    const eliminaRegistroFunction = new lambda.Function(this, "EliminaRegistroFunction", {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'handler.eliminaRegistro', //Método eliminaRegistro del archivo handler.js
      code: lambda.Code.fromAsset(path.resolve(__dirname, 'lambda')), //Directorio donde se encuentra el código
      environment: {
        TABLA_REGISTROS: tablaRegistros.tableName,
      },
    });

    const consultaTodosRegistrosFunction = new lambda.Function(this, "ConsultaTodosRegistrosFunction", {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'handler.consultaTodosRegistros', //Método consultaTodosRegistros del archivo handler.js
      code: lambda.Code.fromAsset(path.resolve(__dirname, 'lambda')), //Directorio donde se encuentra el código
      environment: {
        TABLA_REGISTROS: tablaRegistros.tableName,
      },
    });

    //Permisos para las funciones lambda
    tablaRegistros.grantReadWriteData(nuevoRegistroFunction);
    tablaRegistros.grantReadData(consultaRegistroFunction);
    tablaRegistros.grantReadWriteData(eliminaRegistroFunction);
    tablaRegistros.grantReadData(consultaTodosRegistrosFunction);

    //Creación de API Gateway
    const registrosAPI = new apigw.RestApi(this, "RegistrosApi");

    //Implementación de funciones en el endpoint
    registrosAPI.root
      .resourceForPath("registros")
      .addMethod("PUT", new apigw.LambdaIntegration(nuevoRegistroFunction))
    
    registrosAPI.root
      .resourceForPath("registros")
      .addMethod("GET", new apigw.LambdaIntegration(consultaRegistroFunction))
    
    registrosAPI.root
      .resourceForPath("registros")
      .addMethod("DELETE", new apigw.LambdaIntegration(eliminaRegistroFunction))
    
    registrosAPI.root
      .resourceForPath("registros")
      .addMethod("POST", new apigw.LambdaIntegration(consultaTodosRegistrosFunction))
  }
}
