import { MapPin } from "lucide-react";
import React from "react";
import type { NodeConfig } from "../types";
import { NodeType } from "../node-types.constants";

export const LocationNodeConfig: NodeConfig = {
    type: NodeType.SEND_LOCATION,
    label: "Location",
    category: "messaging",
    icon: React.createElement(MapPin, { size: 16 }),
    description: "Send a location pin with latitude, longitude, and optional name.",
};
