import { ValidationError } from "../utils/utils";
import { NullT } from "./types";

export type StructuredResponse<T = unknown> = {
    status: number;
    message: string;
    data: NullT<T>;
    errors?: ValidationError[];
};
