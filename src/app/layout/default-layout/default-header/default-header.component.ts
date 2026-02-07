import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import {
  AvatarComponent,
  BadgeComponent,
  BreadcrumbRouterComponent,
  ColorModeService,
  ContainerComponent,
  DropdownComponent,
  DropdownDividerDirective,
  DropdownHeaderDirective,
  DropdownItemDirective,
  DropdownMenuDirective,
  DropdownToggleDirective,
  HeaderComponent,
  HeaderNavComponent,
  HeaderTogglerDirective,
  NavItemComponent,
  NavLinkDirective,
  SidebarToggleDirective
} from '@coreui/angular';

import { IconDirective } from '@coreui/icons-angular';
import { AuthService } from '../../../views/pages/login/login.service';
import { UserService } from '../../../core/services/users.service';

@Component({
    selector: 'app-default-header',
    templateUrl: './default-header.component.html',
  imports: [ContainerComponent, HeaderTogglerDirective, SidebarToggleDirective, IconDirective, HeaderNavComponent, RouterLink, NgTemplateOutlet, BreadcrumbRouterComponent, DropdownComponent, DropdownToggleDirective, AvatarComponent, DropdownMenuDirective, DropdownItemDirective, CommonModule,
ReactiveFormsModule,
FormsModule]
})
export class DefaultHeaderComponent extends HeaderComponent implements OnInit {
  email:any = localStorage.getItem('email');
  readonly #colorModeService = inject(ColorModeService);
  readonly colorMode = this.#colorModeService.colorMode;

  showPasswordDialog = false;
  showNotifications = false;
  passwordInput = '';
  user:any
  notifications: any[] = []; // ✅ start empty

  // Count unread notifications
  get unreadCount() {
    return Array.isArray(this.notifications)
      ? this.notifications.filter((n: any) => !n.isRead).length
      : 0;
  }


  toggleNotifications(event: MouseEvent) {
    event.stopPropagation();
    this.showNotifications = !this.showNotifications;

    if (this.showNotifications) {
      document.addEventListener('click', this.handleOutsideClick);
    } else {
      document.removeEventListener('click', this.handleOutsideClick);
    }
  }


  markAsRead(index: number) {
    this.notifications[index].isRead = true;
  }

  readonly colorModes = [
    { name: 'light', text: 'Light', icon: 'cilSun' },
    { name: 'dark', text: 'Dark', icon: 'cilMoon' },
    { name: 'auto', text: 'Auto', icon: 'cilContrast' }
  ];

  readonly icons = computed(() => {
    const currentMode = this.colorMode();
    return this.colorModes.find(mode => mode.name === currentMode)?.icon ?? 'cilSun';
  });

  constructor(private router: Router, private loginService: AuthService, private userService: UserService) {
    super();
  }
  async ngOnInit() {
  try {
    this.user = await this.userService.getUser(this.email);

    const isLocked = this.user?.isLocked || false;
    this.notifications = Array.isArray(this.user?.notifications) ? this.user.notifications : [];
    console.log("🚀 Notifications:", this.notifications);

    if (isLocked) {
      this.showPasswordDialog = true;

      window.onbeforeunload = () => {
        this.signOut(); // Force logout if trying to reload
        return '';
      };
    }
  } catch (error) {
    console.error('Error fetching user:', error);
  }
}

  sidebarId = input('sidebar1');

  public newMessages = [
    {
      id: 0,
      from: 'Jessica Williams',
      avatar: '7.jpg',
      status: 'success',
      title: 'Urgent: System Maintenance Tonight',
      time: 'Just now',
      link: 'apps/email/inbox/message',
      message: 'Attention team, we\'ll be conducting critical system maintenance tonight from 10 PM to 2 AM. Plan accordingly...'
    },
    {
      id: 1,
      from: 'Richard Johnson',
      avatar: '6.jpg',
      status: 'warning',
      title: 'Project Update: Milestone Achieved',
      time: '5 minutes ago',
      link: 'apps/email/inbox/message',
      message: 'Kudos on hitting sales targets last quarter! Let\'s keep the momentum. New goals, new victories ahead...'
    },
    {
      id: 2,
      from: 'Angela Rodriguez',
      avatar: '5.jpg',
      status: 'danger',
      title: 'Social Media Campaign Launch',
      time: '1:52 PM',
      link: 'apps/email/inbox/message',
      message: 'Exciting news! Our new social media campaign goes live tomorrow. Brace yourselves for engagement...'
    },
    {
      id: 3,
      from: 'Jane Lewis',
      avatar: '4.jpg',
      status: 'info',
      title: 'Inventory Checkpoint',
      time: '4:03 AM',
      link: 'apps/email/inbox/message',
      message: 'Team, it\'s time for our monthly inventory check. Accurate counts ensure smooth operations. Let\'s nail it...'
    },
    {
      id: 3,
      from: 'Ryan Miller',
      avatar: '4.jpg',
      status: 'info',
      title: 'Customer Feedback Results',
      time: '3 days ago',
      link: 'apps/email/inbox/message',
      message: 'Our latest customer feedback is in. Let\'s analyze and discuss improvements for an even better service...'
    }
  ];

  public newNotifications = [
    { id: 0, title: 'New user registered', icon: 'cilUserFollow', color: 'success' },
    { id: 1, title: 'User deleted', icon: 'cilUserUnfollow', color: 'danger' },
    { id: 2, title: 'Sales report is ready', icon: 'cilChartPie', color: 'info' },
    { id: 3, title: 'New client', icon: 'cilBasket', color: 'primary' },
    { id: 4, title: 'Server overloaded', icon: 'cilSpeedometer', color: 'warning' }
  ];

  public newStatus = [
    { id: 0, title: 'CPU Usage', value: 25, color: 'info', details: '348 Processes. 1/4 Cores.' },
    { id: 1, title: 'Memory Usage', value: 70, color: 'warning', details: '11444GB/16384MB' },
    { id: 2, title: 'SSD 1 Usage', value: 90, color: 'danger', details: '243GB/256GB' }
  ];

  public newTasks = [
    { id: 0, title: 'Upgrade NPM', value: 0, color: 'info' },
    { id: 1, title: 'ReactJS Version', value: 25, color: 'danger' },
    { id: 2, title: 'VueJS Version', value: 50, color: 'warning' },
    { id: 3, title: 'Add new layouts', value: 75, color: 'info' },
    { id: 4, title: 'Angular Version', value: 100, color: 'success' }
  ];

    async openSecretPopup() {
      console.log('open secret popup');
      await this.userService.updateUser({
        email: this.email,
        isLocked: true
      }).then((res) => {
        console.log('✅ User locked:', res);
      }).catch((err) => {
        console.error('❌ Failed to lock user:', err);
      });
      this.showPasswordDialog = true;

      // Auto-logout on refresh
      window.onbeforeunload = () => {
        this.signOut();
        return '';
      };
    }

    async submitPassword() {
      const response = await this.loginService.validateUser(this.email, this.passwordInput).toPromise();
      console.log("🚀 ~ DefaultHeaderComponent ~ submitPassword ~ response:", response)

      if (response.isValid) {
        await this.userService.updateUser({
          email: this.email,
          isLocked: false
        })
        this.showPasswordDialog = false;
        this.passwordInput = '';
        window.onbeforeunload = null;
      } else {
        alert('كلمة المرور غير صحيحة ، يرجى التأكد من كلمة المرور.');
        this.signOut();
      }
    }

    closeNotifications() {
      this.showNotifications = false;
      document.removeEventListener('click', this.handleOutsideClick);
    }

    // Handle click outside the dropdown
    handleOutsideClick = (event: MouseEvent) => {
      const dropdown = document.querySelector('.dropdown-menu.show');
      const bell = (event.target as HTMLElement).closest('button');

      if (dropdown && !dropdown.contains(event.target as Node) && !bell) {
        this.closeNotifications();
      }
    };

    signOut() {
      console.log('Signing out...');
      // localStorage.clear();
      // sessionStorage.clear();
      this.router.navigate(['/login']);
    }
}
