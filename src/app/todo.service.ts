// Imports
import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/map';

import {Todo} from './todo';

@Injectable()
export class TodoService {

    private _todos: BehaviorSubject<Todo[]>;

    private baseURL = 'http://5832f93dc4ca76120076b234.mockapi.io/';

    private headers = new Headers({'Content-Type': 'application/json'});

    private dataStore: {
        todos: Todo[]
    };

    constructor(private http: Http) {
        this.dataStore = { todos: [] };

        this._todos = <BehaviorSubject<Todo[]>>new BehaviorSubject([]);
    }

    get todos() {
        return this._todos.asObservable();
    }

    loadAll() {
        this.http.get(`${this.baseURL}/todos`)
                .map(response => response.json()).subscribe(data => {
                    this.dataStore.todos = data;
                    this._todos.next(Object.assign({}, this.dataStore).todos);

                }, error => console.log('Could not load todos.'));
    }

    load(id: number | string) {
        this.http.get(`${this.baseURL}/todos/${id}`)
            .map(response => response.json())
            .subscribe(data => {
                let notFound = true;
                this.dataStore.todos
                .forEach((item, index) => {
                    if (item.id === data.id) {
                        this.dataStore.todos[index] = data;
                        notFound = false;
                    }
                });

                if(notFound) {
                    this.dataStore.todos.push(data);
                }
                this._todos.next(Object.assign({}, this.dataStore).todos);

            }, error => console.log('COuld not load todo.'));
    }


    create(todo: Todo) {
        console.log(JSON.stringify(todo));
        this.http.post(`${this.baseURL}/todos`,
                        JSON.stringify(todo),
                        {headers: this.headers})
                        .map(response => response.json())
                        .subscribe(data => {
                            this.dataStore.todos.push(data);
                            this._todos.next(Object.assign({}, this.dataStore).todos);
                        }, error => console.log('Could not create todo.'));    
        }


    toggleTodoComplete(todo: Todo) {
        this.http.put(`${this.baseURL}/todos/${todo.id}`,
                        JSON.stringify(todo))
                        .map(response => response.json()).subscribe(data => {
                            this.dataStore.todos.forEach((t, i) => {
                                if(t.id === data.id) {
                                    data.complete = !t.complete;
                                    this.dataStore.todos[i] = data;
                                }
                            });
                            this._todos.next(Object.assign({}, this.dataStore).todos);
                        }, error => console.log('Could not update todo.'));
    }



    remove(todoId: number) {
        this.http.delete(`${this.baseURL}/todos/${todoId}`)
                        .subscribe(response => {
                            this.dataStore.todos.forEach((t, i) => {
                                if(t.id === todoId) {
                                    this.dataStore.todos.splice(i, 1);
                                }
                            });
                            this._todos.next(Object.assign({},
                                        this.dataStore).todos);
                        }, error => console.log('Could not delete todo.'));
    }



}
