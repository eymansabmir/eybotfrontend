import { MapPin } from "lucide-react";
import React from "react";
import type { NodeConfig } from "../types";
import { NodeType } from "../node-types.constants";

export const LocationRequestNodeConfig: NodeConfig = {
    type: NodeType.LOCATION_REQUEST,
    label: "Location Request",
    category: "messaging",
    icon: React.createElement(MapPin, { size: 16 }),
    description: "Request the user's location via an interactive WhatsApp message.",
};
