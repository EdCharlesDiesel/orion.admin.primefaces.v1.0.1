import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShoppingCartComponent } from './shopping-cart.component';
import { ShoppingCartRoutingModule } from './shopping-cart-routing.module';
import { ProgressBarModule } from 'primeng/progressbar';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { ScrollTopModule } from 'primeng/scrolltop';

@NgModule({
	imports: [
		CommonModule,
		ShoppingCartRoutingModule,
		ProgressBarModule,
		BadgeModule,
		AvatarModule,
		ScrollPanelModule,
		TagModule,
		ChipModule,
		ButtonModule,
		SkeletonModule,
		AvatarGroupModule,
		ScrollTopModule
	],
	declarations: [ShoppingCartComponent]
})
export class ShoppingCartModule { }
