import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute
} from 'amazon-cognito-identity-js';
import config from './config';

import { jwtDecode } from 'jwt-decode';

const poolData = {
  UserPoolId: config.userPoolId , 
  ClientId: config.clientId  
};

const userPool = new CognitoUserPool(poolData);

export default class AuthService {
  static signUp({ email, password }) {
    return new Promise((resolve, reject) => {
      const attributeList = [
        new CognitoUserAttribute({ Name: 'email', Value: email })
      ];
      userPool.signUp(email, password, attributeList, null, (err, result) => {
        if (err) return reject(err);
        const user = result.user;
        resolve({ username: user.getUsername(), email });
      });
    });
  }

  static confirmSignUp({ email, code }) {
    return new Promise((resolve, reject) => {
      const user = new CognitoUser({
        Username: email,
        Pool: userPool
      });

      user.confirmRegistration(code, true, function(err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  static signIn({ email, password }) {
    return new Promise((resolve, reject) => {
      const user = new CognitoUser({
        Username: email,
        Pool: userPool
      });

      const authDetails = new AuthenticationDetails({
        Username: email,
        Password: password
      });

      user.authenticateUser(authDetails, {
        onSuccess: session => {
          const accessToken = session.getAccessToken().getJwtToken();
          const idToken = session.getIdToken().getJwtToken();

          const decoded = jwtDecode(idToken);
          const userId = decoded.sub;

          const userData = {
            email,
            accessToken,
            idToken,
            userId
          };

          sessionStorage.setItem('auth_user', JSON.stringify(userData));
          sessionStorage.setItem('auth_token', idToken); 
          resolve(userData);
        },
        onFailure: err => {
          // Enhanced error handling - ensure error details are preserved
          console.error('Authentication failed:', err);
          
          // Create a structured error object
          const error = {
            code: err.code || err.name,
            message: err.message,
            name: err.name
          };
          
          reject(error);
        }
      });
    });
  }

  static async signOut() {
    const storedUser = JSON.parse(sessionStorage.getItem('auth_user'));
    if (storedUser) {
      const user = new CognitoUser({
        Username: storedUser.email,
        Pool: userPool
      });
      user.signOut();
    }
    sessionStorage.removeItem('auth_user');
    sessionStorage.removeItem('auth_token');
    return true;
  }

  static async getCurrentUser() {
    const storedUser = sessionStorage.getItem('auth_user');
    const storedToken = sessionStorage.getItem('auth_token');
    if (storedUser && storedToken) {
      return JSON.parse(storedUser);
    }
    return null;
  }

  static getAuthToken() {
    return sessionStorage.getItem('auth_token');
  }

  static isAuthenticated() {
    const token = this.getAuthToken();
    return !!token;
  }
}