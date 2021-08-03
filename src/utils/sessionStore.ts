class SessionStore {
    findSession(id: string) {};
    saveSession(id: string, session: any) {}
    findAllSessions(){}
}

class InMemorySessionStore extends SessionStore {
    sessions: any;
    constructor() {
        super();
        this.sessions = new Map()
    }

    findSession(id: string) {
        return this.sessions.get(id)
    }

    saveSession(id: string, session: any) {
        this.sessions.set(id, session)
    }

    findAllSessions() {
        let allSessions = [];
        this.sessions.forEach(element => {
            allSessions.push(element)
        });
        return allSessions;
    }
}

export default new InMemorySessionStore()