// work around
import { BaseExpression, Identifier } from "estree";

export interface TSTypeReference extends BaseExpression {
  type: "TSTypeReference";
  transformFlags?: boolean;
  typeName: Identifier;
  typeParameters: TSTypeParameterInstantiation;
}

export interface TSTypeParameterInstantiation extends BaseExpression {
  type: "TSTypeParameterInstantiation";
  params: any[];
}
