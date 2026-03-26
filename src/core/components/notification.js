// Notification Component - Toast Notification System

class NotificationSystem {
  constructor() {
    this.container = document.getElementById('notification-container');
    this.notifications = [];
    this.nextId = 1;
    this.defaultDuration = 4000; // 4 seconds
  }

  /**
   * Show notification
   * @param {string} message - Notification message
   * @param {string} type - Notification type (success, error, warning, info)
   * @param {Object} options - Additional options
   */
  show(message, type = 'info', options = {}) {
    const id = this.nextId++;
    const duration = options.duration || this.defaultDuration;

    const notification = this.createNotificationElement(id, message, type, options);
    this.container.appendChild(notification);

    // Store reference
    this.notifications.push({
      id,
      element: notification,
      type
    });

    // Auto-dismiss
    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }

    // Emit event
    window.EventBus.emit('notification:shown', { id, message, type });

    return id;
  }

  /**
   * Create notification DOM element
   */
  createNotificationElement(id, message, type, options) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.dataset.notificationId = id;

    const header = document.createElement('div');
    header.className = 'notification-header';

    const title = document.createElement('div');
    title.className = 'notification-title';
    title.textContent = options.title || this.getDefaultTitle(type);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'notification-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = () => this.dismiss(id);

    header.appendChild(title);
    header.appendChild(closeBtn);

    const body = document.createElement('div');
    body.className = 'notification-body';
    body.textContent = message;

    notification.appendChild(header);
    notification.appendChild(body);

    return notification;
  }

  /**
   * Get default title for notification type
   */
  getDefaultTitle(type) {
    const titles = {
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Information'
    };
    return titles[type] || 'Notification';
  }

  /**
   * Dismiss notification
   * @param {number} id - Notification ID
   */
  dismiss(id) {
    const index = this.notifications.findIndex(n => n.id === id);
    
    if (index === -1) {
      return;
    }

    const notification = this.notifications[index];
    
    // Fade out animation
    notification.element.style.opacity = '0';
    notification.element.style.transform = 'translateX(100%)';

    setTimeout(() => {
      if (notification.element.parentNode) {
        notification.element.parentNode.removeChild(notification.element);
      }
      this.notifications.splice(index, 1);
    }, 300);

    window.EventBus.emit('notification:dismissed', id);
  }

  /**
   * Convenience methods
   */
  success(message, options = {}) {
    return this.show(message, 'success', options);
  }

  error(message, options = {}) {
    return this.show(message, 'error', { ...options, duration: 0 }); // Don't auto-dismiss errors
  }

  warning(message, options = {}) {
    return this.show(message, 'warning', options);
  }

  info(message, options = {}) {
    return this.show(message, 'info', options);
  }

  /**
   * Clear all notifications
   */
  clearAll() {
    const ids = this.notifications.map(n => n.id);
    ids.forEach(id => this.dismiss(id));
  }
}

// Create global notification instance
window.Notification = new NotificationSystem();
