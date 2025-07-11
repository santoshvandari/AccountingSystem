import { getAccessToken,clearAccessToken } from "../helpers/browserStorage";
// Base configuration
const API_BASE_URL = import.meta.env.VITE_API_URL+"/api" || 'http://localhost:8000/api';


/**
 * Creates request headers with optional authentication
 * @param {boolean} includeAuth - Whether to include auth token
 * @returns {Headers} Headers object
 */
const createHeaders = (includeAuth = true) => {
    const headers = new Headers({
        'Content-Type': 'application/json',
    });

    if (includeAuth) {
        const token = getAccessToken();
        if (token) {
            headers.append('Authorization', `Bearer ${token}`);
        }
    }

    return headers;
};

/**
 * Makes a request to the API
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise} Promise with response data
 */
const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    try {
        const response = await fetch(url, options);

        // Try to parse JSON if possible
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json') && response.status !== 204) {
            data = await response.json();
        } else {
            data = await response.text();
        }
        
        if (!response.ok) {
            // Attach detailed error info
            if (response.status === 401) {
                clearAccessToken(); // Clear token on unauthorized access
            }
            const error = new Error(data?.message || 'Request failed');
            error.status = response.status;
            error.data = data;
            throw error;
        }

        return {
            status: response.status,
            data,
            headers: response.headers
        };
    } catch (error) {
        // Network error or JSON parsing error
        if (error instanceof SyntaxError) {
            // JSON parse error
            console.error('Response is not valid JSON:', error);
            throw new Error('Invalid JSON response from server');
        }

        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            // Network failure (offline, server down, CORS error)
            console.error('Network error:', error);
            throw new Error('Network error: Unable to reach the server');
        }

        // Re-throw error with detailed info
        console.error('API request error:', error);
        throw error;
    }
};

const Base = {
    /**
     * Send a GET request
     * @param {string} endpoint - API endpoint
     * @returns {Promise} Promise with response data
     */
    get: (endpoint) => {
        return apiRequest(endpoint, {
            method: 'GET',
            headers: createHeaders()
        });
    },

    /**
     * Send a POST request
     * @param {string} endpoint - API endpoint
     * @param {Object} body - Request body
     * @param {boolean} authenticate - Whether to authenticate the request
     * @returns {Promise} Promise with response data
     */
    post: (endpoint, body, authenticate = true) => {
        // Ensure body is stringified JSON
        const payload = typeof body === 'string' ? body : JSON.stringify(body);

        return apiRequest(endpoint, {
            method: 'POST',
            headers: createHeaders(authenticate),
            body: payload
        });
    },

    /**
     * Send a PUT request
     * @param {string} endpoint - API endpoint
     * @param {Object} body - Request body
     * @returns {Promise} Promise with response data
     */
    put: (endpoint, body) => {
        return apiRequest(endpoint, {
            method: 'PUT',
            headers: createHeaders(),
            body: JSON.stringify(body)
        });
    },

    /**
     * Send a DELETE request
     * @param {string} endpoint - API endpoint
     * @returns {Promise} Promise with response data
     */
    delete: (endpoint, payload) => {
        return apiRequest(endpoint, {
            method: 'DELETE',
            headers: createHeaders(),
            body: payload ? JSON.stringify(payload) : undefined
        });
    },
};



export default Base;