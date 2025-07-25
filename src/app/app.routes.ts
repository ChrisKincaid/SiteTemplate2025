import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { SingleCategory } from './pages/single-category/single-category';
import { SinglePost } from './pages/single-post/single-post';
import { AboutUs } from './pages/about-us/about-us';
import { Terms } from './pages/terms/terms';
import { ContactUs } from './pages/contact-us/contact-us';

export const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'category', component: SingleCategory},
    {path: 'post/:id', component: SinglePost},

    {path: 'about', component: AboutUs},
    {path: 'terms', component: Terms},
    {path: 'contact', component: ContactUs}
];
