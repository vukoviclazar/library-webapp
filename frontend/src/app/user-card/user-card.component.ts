import { Component, OnInit, Input } from '@angular/core';
import { User } from '../models/user';
import { userAvatarsUri } from '../services/constants';

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.css']
})
export class UserCardComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  @Input() user: User
  avatarUri: string = userAvatarsUri
}
