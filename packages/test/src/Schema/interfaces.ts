export interface IConfig {
    dsn: string;
}

export interface IState {
    timestamp: number;
}

export interface ISessionState {
    session: string;
}

export interface IStateGuest extends IState {
    authorized: false;
}

export interface IStateUser extends IState, ISessionState {
    authorized: true;
}

export type ITestState = IStateGuest | IStateUser;
