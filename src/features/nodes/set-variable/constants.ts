import React from "react";
import { 
    Type, 
    Variable as VarIcon, 
    Hash, 
    Shuffle, 
    XCircle, 
    Calendar, 
    Code,
    Phone,
    User
} from "lucide-react";

export const SYSTEM_VARIABLES = [
    { label: "User Phone", value: "contact.waId", icon: React.createElement(Phone, { size: 10 }) },
    { label: "User Name", value: "contact.name", icon: React.createElement(User, { size: 10 }) },
    { label: "Current Date", value: "system.date", icon: React.createElement(Calendar, { size: 10 }) },
    { label: "Current Time", value: "system.now", icon: React.createElement(Calendar, { size: 10 }) },
];

export const OPERATION_TYPES = [
    { value: "value", label: "Custom Value", icon: React.createElement(Type, { size: 12 }) },
    { value: "variable", label: "Variable", icon: React.createElement(VarIcon, { size: 12 }) },
    { value: "system", label: "System", icon: React.createElement(Hash, { size: 12 }) },
    { value: "random_number", label: "Random Num", icon: React.createElement(Shuffle, { size: 12 }) },
    { value: "random_string", label: "Random Str", icon: React.createElement(Shuffle, { size: 12 }) },
    { value: "clear", label: "Clear", icon: React.createElement(XCircle, { size: 12 }) },
    { value: "date", label: "Date", icon: React.createElement(Calendar, { size: 12 }) },
    { value: "expression", label: "Expression", icon: React.createElement(Code, { size: 12 }) },
] as const;
