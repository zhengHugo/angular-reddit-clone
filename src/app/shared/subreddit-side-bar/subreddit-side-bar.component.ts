import { Component, OnInit } from '@angular/core';
import { SubredditModel } from '../../subreddit/subreddit-model';
import { SubredditService } from '../../subreddit/subreddit.service';

@Component({
  selector: 'app-subreddit-side-bar',
  templateUrl: './subreddit-side-bar.component.html',
  styleUrls: ['./subreddit-side-bar.component.css']
})
export class SubredditSideBarComponent implements OnInit {

  subreddits: SubredditModel[];
  displayViewAll: boolean;

  constructor(private subredditService: SubredditService) {
    this.subredditService.getAllSubreddits().subscribe(data => {
      if (data.length >= 4){
        this.subreddits = data.splice(0, 3);
        this.displayViewAll = true;
      } else {
        this.subreddits = data;
        this.displayViewAll = false;
      }
    });
  }

  ngOnInit(): void {
  }

}
