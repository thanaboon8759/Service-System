import api from './axios';

export const ticketApi = {
    getUserTickets: async () => {
        const res = await api.get('/tickets');
        return res.data;
    },
    createTicket: async (ticketData) => {
        const res = await api.post('/tickets', ticketData);
        return res.data;
    },
    getTicket: async (id) => {
        const res = await api.get(`/tickets/${id}`);
        return res.data;
    },
    addMessage: async (id, text) => {
        const res = await api.post(`/tickets/${id}/messages`, { text });
        return res.data;
    },
    // Admin API
    getAllTickets: async () => {
        const res = await api.get('/tickets/all/list');
        return res.data;
    },
    updateTicket: async (id, data) => {
        const res = await api.put(`/tickets/${id}`, data);
        return res.data;
    }
};
