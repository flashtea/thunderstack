
export interface Event {
    id?: string;
    tags?: string[][];
    pubkey?: string;
}

export interface Question extends Event {
    title: string;
    message: string;
    picture?: string;
}

export interface Answer extends Event {
    message: string;
    vote: number;
}

export interface Comment extends Event {
    message: string;
}

export interface Tip {
    answer?: Answer;
    amount: number;
}