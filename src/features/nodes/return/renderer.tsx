import type { NodeProps } from "@xyflow/react";
import { CornerDownLeft } from "lucide-react";
import { NodeFrame } from "@/features/nodes/presentation/components/node-frame";
import type { ReturnNodeData } from "./schema";
import { returnNodeConfig } from "./config";

export function ReturnNodeRenderer({ selected }: NodeProps & { data: ReturnNodeData }) {
    return (
        <NodeFrame
            selected={selected}
            icon={<CornerDownLeft size={16} />}
            title="Return"
            popoverTitle="Configure Return"
            description={returnNodeConfig.description}
            summary="Return to previous jump location"
            showPopover={selected}
            showBottomHandle={false}
            popoverClassName="w-[300px]"
            popoverBody={
                <div className="space-y-4">
                    <div className="pt-2">
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                            This node teleports the user back to the point immediately following the last "Jump" node that was executed.
                        </p>
                    </div>
                </div>
            }
        />
    );
}
