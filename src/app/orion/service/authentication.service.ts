import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { SubscriptionService } from './subscription.service';
import {User} from "../pages/user-login/user";
import {Product} from "../api/product";
import {environment} from "../../../environments/environment";
import {LoginDto} from "../pages/authentication/login/loginDto";

export interface ApplicationUser {
  accessToken: string;
  expiresIn: Date;
  username: string;
}
@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {


  oldUserId;
  baseURL = environment.baseURL;
  constructor(
    private http: HttpClient,
    private subscriptionService: SubscriptionService) {
    this.oldUserId = JSON.parse(localStorage.getItem('userId') || '{}');
  }

  public login(user: LoginDto) {
    let emailAddress = user.email;
    let password = user.password;
    return this.http.post<any>(this.baseURL + 'Authentication/login', user)
      .pipe(map(response => {
        if (response && response.token) {
          this.oldUserId = JSON.parse(localStorage.getItem('userId') || '{}');
          localStorage.setItem('authToken', response.token);
          this.setUserDetails();
          localStorage.setItem('userId', response.userDetails.userId);
          this.subscriptionService.cartItemcount$.next(response.carItemCount);
        }

        return response;

      }));
  }

  public setUserDetails():void {
    if (localStorage.getItem('authToken')) {
      const userDetails = new User() ;
      const decodeUserDetails = JSON.parse(atob(localStorage.getItem('authToken')!.split('.')[1]));

      userDetails.userId = decodeUserDetails.userid;
      userDetails.username = decodeUserDetails.sub;
      userDetails.userTypeId = Number(decodeUserDetails.userTypeId);
      userDetails.isLoggedIn = true;

    //  this.subscriptionService.userData.next(userDetails);
    }
  }

  public  logout() : void{
    localStorage.clear();
    this.resetSubscription();
    this.setTempUserId();
  }

  public  setTempUserId() :void{
    if (!localStorage.getItem('userId')) {
      const tempUserID = this.generateTempUserId();
      localStorage.setItem('userId', tempUserID.toString());
    }
  }

  public  generateTempUserId(): number {
    return Math.floor(Math.random() * (99999 - 11111 + 1) + 12345);
  }

  public  resetSubscription() : void {
    this.subscriptionService.userData.next(new Product());
    //FIXME need to include wishlist items.
    //this.subscriptionService.wishlistItem$.next([]);
    this.subscriptionService.wishlistItemcount$.next(0);
    this.subscriptionService.cartItemcount$.next(0);
  }
}