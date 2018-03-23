import {Injectable} from '@angular/core';
import {CanActivate} from '@angular/router';
import {AuthService} from '../auth/auth.service';

@Injectable()
export class CanActivateViaAuthGuard implements CanActivate {

  constructor (private authService: AuthService) {}
  
  canActivate() {
    return JSON.parse(localStorage.getItem('logged'));
  }
}