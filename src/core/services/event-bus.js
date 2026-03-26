// Event Bus - Plugin Communication System
// Allows plugins to communicate without direct references

class EventBus {
  constructor() {
    this.events = new Map();
    this.logEvents = false; // Set to true for debugging
  }

  /**
   * Subscribe to an event
   * @param {string} eventName - Name of the event
   * @param {Function} callback - Function to call when event is emitted
   * @returns {Function} Unsubscribe function
   */
  on(eventName, callback) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }

    this.events.get(eventName).push(callback);

    if (this.logEvents) {
      console.log(`[EventBus] Subscribed to: ${eventName}`);
    }

    // Return unsubscribe function
    return () => this.off(eventName, callback);
  }

  /**
   * Subscribe to an event once (auto-unsubscribe after first call)
   * @param {string} eventName - Name of the event
   * @param {Function} callback - Function to call when event is emitted
   */
  once(eventName, callback) {
    const onceCallback = (...args) => {
      callback(...args);
      this.off(eventName, onceCallback);
    };

    this.on(eventName, onceCallback);
  }

  /**
   * Unsubscribe from an event
   * @param {string} eventName - Name of the event
   * @param {Function} callback - Function to remove
   */
  off(eventName, callback) {
    if (!this.events.has(eventName)) {
      return;
    }

    const callbacks = this.events.get(eventName);
    const index = callbacks.indexOf(callback);

    if (index > -1) {
      callbacks.splice(index, 1);
    }

    if (callbacks.length === 0) {
      this.events.delete(eventName);
    }

    if (this.logEvents) {
      console.log(`[EventBus] Unsubscribed from: ${eventName}`);
    }
  }

  /**
   * Emit an event
   * @param {string} eventName - Name of the event
   * @param {...any} args - Arguments to pass to callbacks
   */
  emit(eventName, ...args) {
    if (!this.events.has(eventName)) {
      if (this.logEvents) {
        console.log(`[EventBus] No subscribers for: ${eventName}`);
      }
      return;
    }

    const callbacks = this.events.get(eventName);

    if (this.logEvents) {
      console.log(`[EventBus] Emitting: ${eventName}`, args);
    }

    callbacks.forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`[EventBus] Error in callback for ${eventName}:`, error);
      }
    });
  }

  /**
   * Request data from other plugins (first responder wins)
   * @param {string} eventName - Name of the request event
   * @param {number} timeout - Timeout in ms (default: 1000)
   * @returns {Promise} Promise that resolves with the response
   */
  async request(eventName, timeout = 1000) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.off(responseEvent, responseHandler);
        reject(new Error(`Request timeout for ${eventName}`));
      }, timeout);

      const responseEvent = `${eventName}:response`;

      const responseHandler = (data) => {
        clearTimeout(timeoutId);
        this.off(responseEvent, responseHandler);
        resolve(data);
      };

      this.once(responseEvent, responseHandler);
      this.emit(eventName);
    });
  }

  /**
   * Respond to a request event
   * @param {string} eventName - Name of the request event
   * @param {Function} handler - Function that returns the response
   */
  respond(eventName, handler) {
    this.on(eventName, async () => {
      try {
        const response = await handler();
        this.emit(`${eventName}:response`, response);
      } catch (error) {
        console.error(`[EventBus] Error in responder for ${eventName}:`, error);
        this.emit(`${eventName}:response`, { error: error.message });
      }
    });
  }

  /**
   * Clear all event listeners
   */
  clear() {
    this.events.clear();
    if (this.logEvents) {
      console.log('[EventBus] Cleared all events');
    }
  }

  /**
   * Get list of all registered events
   * @returns {Array<string>} Array of event names
   */
  getRegisteredEvents() {
    return Array.from(this.events.keys());
  }

  /**
   * Get number of subscribers for an event
   * @param {string} eventName - Name of the event
   * @returns {number} Number of subscribers
   */
  getSubscriberCount(eventName) {
    if (!this.events.has(eventName)) {
      return 0;
    }
    return this.events.get(eventName).length;
  }

  /**
   * Enable/disable event logging
   * @param {boolean} enabled - Whether to enable logging
   */
  setLogging(enabled) {
    this.logEvents = enabled;
  }
}

// Create global event bus instance
window.EventBus = new EventBus();
