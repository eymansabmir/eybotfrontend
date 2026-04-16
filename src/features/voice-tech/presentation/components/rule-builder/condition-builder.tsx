import { ConditionGroup } from "./condition-group";
import type {
  EntityAttribute,
  RoutingCondition,
  LogicalOperator,
} from "../../../types";

interface ConditionBuilderProps {
  value: { operator: LogicalOperator; children: RoutingCondition[] };
  attributes: EntityAttribute[];
  onChange: (updated: { operator: LogicalOperator; children: RoutingCondition[] }) => void;
}

export function ConditionBuilder({ value, attributes, onChange }: ConditionBuilderProps) {
  return (
    <div className="space-y-2">
      {attributes.length === 0 ? (
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
