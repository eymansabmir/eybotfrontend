import { ConditionGroup } from "./condition-group";
import type {
  EntityAttribute,
  RoutingCondition,
  LogicalOperator,
} from "../../../types";

interface ConditionBuilderProps {
  value: { operator: LogicalOperator; children: RoutingCondition[] };
  attributes: EntityAttribute[] | Record<string, EntityAttribute[]>;
  onChange: (updated: { operator: LogicalOperator; children: RoutingCondition[] }) => void;
}

export function ConditionBuilder({ value, attributes, onChange }: ConditionBuilderProps) {
  const hasAttributes = Array.isArray(attributes) 
    ? attributes.length > 0 
    : Object.keys(attributes).length > 0;

  return (
    <div className="space-y-2">
      {!hasAttributes ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No attributes found. Ingest some entity data first to populate the condition builder.
          </p>
        </div>
      ) : (
        <ConditionGroup
          node={value}
          attributes={attributes}
          depth={0}
          onChange={onChange}
        />
      )}
    </div>
  );
}
