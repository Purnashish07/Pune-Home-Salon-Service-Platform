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
          title: 'Allow Camera Access?',
          message: 'SalonPune needs camera access to analyze your face shape and show hairstyle previews',
          privacy: '🔐 Privacy: Your photo will only be used for analysis and will not be saved anywhere. We respect your privacy.'
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
   * Request camera permission with comprehensive error handling
   * @returns {Promise<MediaStream|null>} Camera stream or null if denied/failed
   */
  async requestCamera() {
    try {
      const choice = await this.requestPermission('camera');
      
      if (choice === 'deny') {
        console.log('User denied camera permission');
        return null;
      }

      // Request camera with proper constraints for different devices
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      return stream;
    } catch (error) {
      // Handle specific error types
      let errorMessage = 'Failed to access camera';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera permission was denied. Please check your browser settings or try again.';
        console.warn('Camera permission denied by user or system');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = 'No camera device found. Please check if your camera is connected.';
        console.warn('No camera device detected');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage = 'Camera is in use by another application. Please close other apps using the camera.';
        console.warn('Camera is in use by another application');
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'Your camera does not support the required settings. Trying with basic settings...';
        console.warn('Camera constraints not supported, retrying with basic settings');
        
        // Fallback: try with minimal constraints
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          return stream;
        } catch (fallbackError) {
          console.error('Fallback camera access also failed:', fallbackError);
          return null;
        }
      } else if (error.name === 'PermissionDeniedError') {
        errorMessage = 'Camera access requires HTTPS or localhost. Please use a secure connection.';
        console.warn('HTTPS/localhost required for camera access');
      } else if (error.name === 'TypeError') {
        errorMessage = 'getUserMedia API is not supported in this browser.';
        console.warn('getUserMedia not supported');
      }
      
      console.error('Camera access error:', error.name, error.message);
      
      // Return error message so caller can display it
      return { error: errorMessage };
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
