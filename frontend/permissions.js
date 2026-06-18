/**
 * Permission Handler Module
 * Manages camera, microphone, location, and notification permissions
 * with a user-selected choice: "While using the app", "Only this time", or "Don't allow"
 */

class PermissionHandler {
  constructor() {
    this.permissionChoices = new Map(); // Store user choices per permission type
    this.sessionPermissions = new Map(); // Temporary permissions for "only this time"
  }

  /**
   * Show permission dialog and get user choice
   * @param {string} permissionType - Type of permission: 'camera', 'microphone', 'location', 'notification'
   * @returns {Promise<string>} User's choice: 'while-using', 'only-this-time', or 'deny'
   */
  async requestPermission(permissionType) {
    // Validate permission type
    const validTypes = ['camera', 'microphone', 'location', 'notification'];
    if (!validTypes.includes(permissionType)) {
      console.error(`Invalid permission type: ${permissionType}`);
      return 'deny';
    }

    // Check if user has a persistent choice for this permission
    if (this.permissionChoices.has(permissionType)) {
      return this.permissionChoices.get(permissionType);
    }

    // Check if user has a session choice (only this time) that's still valid
    if (this.sessionPermissions.has(permissionType)) {
      return this.sessionPermissions.get(permissionType);
    }

    // Show dialog and wait for user choice
    const choice = await this.showPermissionDialog(permissionType);
    
    // Store the choice based on selection
    if (choice === 'while-using') {
      this.permissionChoices.set(permissionType, 'while-using');
    } else if (choice === 'only-this-time') {
      this.sessionPermissions.set(permissionType, 'only-this-time');
    }
    // 'deny' choice is not stored, user will see dialog again next time

    return choice;
  }

  /**
   * Display permission dialog and return user's choice
   * @private
   */
  showPermissionDialog(permissionType) {
    return new Promise((resolve) => {
      const dialog = document.getElementById('permissionDialog');
      const backdrop = document.getElementById('permissionBackdrop');
      const titleElement = document.getElementById('permissionTitle');
      const messageElement = document.getElementById('permissionMessage');
      const whileUsingBtn = document.getElementById('permissionWhileUsing');
      const onlyThisTimeBtn = document.getElementById('permissionOnlyThisTime');
      const denyBtn = document.getElementById('permissionDeny');

      // Set permission-specific text
      const permissionTexts = {
        camera: {
          title: 'Camera Permission',
          message: 'This app would like to access your camera to take photos or record videos for your salon services.',
          privacy: '🔒 Privacy: Photo will only be used for analysis, will not be saved anywhere.'
        },
        microphone: {
          title: 'Microphone Permission',
          message: 'This app would like to access your microphone to enable audio communication for consultations.',
          privacy: ''
        },
        location: {
          title: 'Location Permission',
          message: 'This app would like to access your location to help find nearby salon services and arrange home visits.',
          privacy: ''
        },
        notification: {
          title: 'Notification Permission',
          message: 'This app would like to send you notifications about bookings, reminders, and service updates.',
          privacy: ''
        }
      };

      const text = permissionTexts[permissionType];
      titleElement.textContent = text.title;
      messageElement.textContent = text.message;
      
      // Show/hide privacy notice
      const privacyElement = document.getElementById('permissionPrivacy');
      if (text.privacy) {
        privacyElement.textContent = text.privacy;
        privacyElement.classList.add('show');
      } else {
        privacyElement.textContent = '';
        privacyElement.classList.remove('show');
      }

      // Remove all existing event listeners by cloning elements
      const newWhileUsing = whileUsingBtn.cloneNode(true);
      const newOnlyThisTime = onlyThisTimeBtn.cloneNode(true);
      const newDeny = denyBtn.cloneNode(true);

      whileUsingBtn.parentNode.replaceChild(newWhileUsing, whileUsingBtn);
      onlyThisTimeBtn.parentNode.replaceChild(newOnlyThisTime, onlyThisTimeBtn);
      denyBtn.parentNode.replaceChild(newDeny, denyBtn);

      // Create handler function to clean up and resolve
      const handleChoice = (choice) => {
        // Hide dialog
        dialog.classList.add('hidden');
        backdrop.classList.add('hidden');
        resolve(choice);
      };

      // Add new event listeners
      document.getElementById('permissionWhileUsing').addEventListener('click', () => {
        handleChoice('while-using');
      });

      document.getElementById('permissionOnlyThisTime').addEventListener('click', () => {
        handleChoice('only-this-time');
      });

      document.getElementById('permissionDeny').addEventListener('click', () => {
        handleChoice('deny');
      });

      // Show dialog
      dialog.classList.remove('hidden');
      backdrop.classList.remove('hidden');
    });
  }

  /**
   * Request camera permission
   */
  async requestCamera() {
    const choice = await this.requestPermission('camera');
    
    if (choice === 'deny') {
      console.log('Camera permission denied');
      return null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      return stream;
    } catch (error) {
      console.error('Failed to access camera:', error);
      return null;
    }
  }

  /**
   * Request microphone permission
   */
  async requestMicrophone() {
    const choice = await this.requestPermission('microphone');
    
    if (choice === 'deny') {
      console.log('Microphone permission denied');
      return null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true 
      });
      return stream;
    } catch (error) {
      console.error('Failed to access microphone:', error);
      return null;
    }
  }

  /**
   * Request geolocation permission
   */
  async requestLocation() {
    const choice = await this.requestPermission('location');
    
    if (choice === 'deny') {
      console.log('Location permission denied');
      return null;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.error('Failed to get location:', error);
          resolve(null);
        }
      );
    });
  }

  /**
   * Request notification permission
   */
  async requestNotification() {
    const choice = await this.requestPermission('notification');
    
    if (choice === 'deny') {
      console.log('Notification permission denied');
      return false;
    }

    // Check if browser supports notifications
    if (!('Notification' in window)) {
      console.log('Browser does not support notifications');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }

  /**
   * Clear all stored permissions
   */
  clearPermissions() {
    this.permissionChoices.clear();
    this.sessionPermissions.clear();
  }

  /**
   * Clear session-only permissions (useful on app close or logout)
   */
  clearSessionPermissions() {
    this.sessionPermissions.clear();
  }

  /**
   * Get current permission choice for a permission type
   */
  getPermissionChoice(permissionType) {
    if (this.permissionChoices.has(permissionType)) {
      return this.permissionChoices.get(permissionType);
    }
    if (this.sessionPermissions.has(permissionType)) {
      return 'only-this-time';
    }
    return null;
  }

  /**
   * Check if permission has been granted
   */
  isPermissionGranted(permissionType) {
    const choice = this.getPermissionChoice(permissionType);
    return choice === 'while-using' || choice === 'only-this-time';
  }
}

// Export singleton instance
const permissionHandler = new PermissionHandler();
