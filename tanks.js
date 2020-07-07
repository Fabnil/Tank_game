 let canvas = document.getElementById("gameZone"), /*Получение холста из DOM*/
     gameZone = canvas.getContext("2d"),/*Получение контекста — через него можно работать с холстом*/
     back_img = new Image();/*в будующем задний фон(ниже задаёся путь к нужной картинке)*/
     back_img.src = "sprites/back.png", /*путь к background*/
     keys = /*keyCode - ы клавиш управления*/{
       forward: 38,   /*стрелка вверх*/
       back: 40,     /*стрелка вниз*/
       left: 37,     /*стрелка влево*/
       right: 39,    /*стрелка вправо*/
       shoot: 32     /*пробел*/},
     images_urls = {/*объект, содержащий ВСЕ url адреса ВСЕХ картинок из игры*/
       /*Анимашки игрока - массивы, имеющие несколько подряд идущих одинаковых картинок, чтобы не делать шипко сложную 60 fps анимацию, и чтобы при этом на игроке не мелькали угсеницы*/
       up_pos_player:new Array("sprites/player_up.png","sprites/player_up.png","sprites/player_up_2.png","sprites/player_up_2.png","sprites/player_up_3.png","sprites/player_up_3.png","sprites/player_up_4.png","sprites/player_up_4.png"), /*игрок(массив анимашек), едущий вверх(вперёд)*/
       left_pos_player:new Array("sprites/player_left.png","sprites/player_left.png","sprites/player_left_2.png","sprites/player_left_2.png","sprites/player_left_3.png","sprites/player_left_3.png","sprites/player_left_4.png","sprites/player_left_4.png"),/*игрок(массив анимашек), едущий влево*/
       right_pos_player:new Array("sprites/player_right.png","sprites/player_right.png","sprites/player_right_2.png","sprites/player_right_2.png","sprites/player_right_3.png","sprites/player_right_3.png","sprites/player_right_4.png","sprites/player_right_4.png"),/*игрок(массив анимашек)), едущий вправо*/
       back_pos_player:new Array("sprites/player_back.png","sprites/player_back.png","sprites/player_back_2.png","sprites/player_back_2.png","sprites/player_back_3.png","sprites/player_back_3.png","sprites/player_back_4.png","sprites/player_back_4.png"),/*игрок(массив анимашек)), едущий вниз(назад)*/
       bullet_all:new Array("sprites/bullet.png"),/*массоив путей к картинкам пули(0 - нормальное состояние, далее анимашка уничтожения)*/
       walls:new Array(new Array())/*массив с картинками стен(красными). Потом будут и другие цвета*/
     },
     bullet_speed_in_gamer_speed = 3,
     player = {/*объект, управляемый игроком(танчик)*/
       img: new Image(),/*картинка танка(сразу после объявления объекта указал url картинки)*/
       speed: 10,/*скаорость в точках канваса*/
       direction: 'top',/*или 'left' или 'right' или 'back'*/
       x: 380,/*позиция (на канвасе) по x(значение - начальная координата игрока по x)*/
       y: 380,/*позиция (на канвасе) по y(значение - начальная координата игрока по y)*/
       Size:{ /*размеры игрока(картинки танка)(нужно для взаимодействий и т.п.)*/
         width:78,/*ширина*/
         height:77/*высота*/
       },
       shooted: 0,/*сколько раз выстрелил(изначально - ноль, с каждым созданием новой пули(выстрелом) +1)*/
       animCounter: 0, /*для анимирования в будующем(чтоб пошагово менять каритнки)(ИНДЕКС элементов картинок анимации в массивах с ними)*/
       Shooted_recently: false, /*недавно стрелял(для ограничения скорострельности)*/
       fireRate: 10, /*максимальное кол-во выстрелов в секунду*/
       goForward(){/*ехать вперёд(вверх)*/
         if (this.direction != "back") {
           this.img.src = images_urls.up_pos_player[this.animCounter] /* путь к танку*/
           this.direction = 'top' /*изменить направление движения на нужное*/
           if (this.y > this.speed)/*проверка на то, чтобы не выйти из канваса*/{
             this.y -= this.speed/*переместиться на скорость точек в канвасе вверх(вперёд)*/
             if(this.animCounter+1 < images_urls.up_pos_player.length)/*если анимашки ещё не закончились*/{
               this.animCounter++
             }
             else/*иначе(если анимашки закончились)*/{
               this.animCounter = 0;/*сбросить счётчик анимашек*/
             }
           }
         }
       },
       goBack()/*ехать назад(вниз)*/{
        if(this.direction != "top"/*если нет попытки развернуться сразу на 180 градусов*/){
           this.img.src = images_urls.back_pos_player[this.animCounter] /* путь к танку*/
           this.direction = "back" /*изменить направление движения на нужное*/
           if (this.y < canvas.height - 70 - this.speed)/*проверка на то, чтобы не выйти из канваса*/{
             this.y += this.speed/*переместиться на скорость точек в канвасе назад(вниз)*/
             if(this.animCounter+1 < images_urls.back_pos_player.length)/*если анимашки ещё не закончились*/{
               this.animCounter++
             }
             else/*иначе(если анимашки закончились)*/{
               this.animCounter = 0;/*сбросить счётчик анимашек*/
             }
           }/*если мы упёрлись в ограничение*/else {this.img.src = images_urls.back_pos_player[this.animCounter]/*повернуться, даже если упрёмся в стену*/}
         }
       },
       goLeft()/*ехать влево*/{
         if(this.direction!="right"/*если нет попытки развернуться сразу на 180 градусов*/){
           this.direction = "left" /*изменить направление движения на нужное*/
           if (this.x > this.speed)/*проверка на то, чтобы не выйти из канваса при перемещении влево(левая граница канваса - 0)*/{
             this.x -= this.speed/*переместиться на скорость точек в канвасе влево*/
             this.img.src = images_urls.left_pos_player[this.animCounter]
             if(this.animCounter+1 < images_urls.left_pos_player.length)/*если анимашки ещё не закончились*/{
               this.animCounter++
             }
             else/*иначе(если анимашки закончились)*/{
               this.animCounter = 0;/*сбросить счётчик анимашек*/
             }
           } else{this.img.src = images_urls.left_pos_player[this.animCounter] /*повернуться, даже если упрёмся в стену*/}
         }
       },
       goRight()/*ехать влево*/{
       if(this.direction != "left"/*если нет попытки развернуться сразу на 180 градусов*/){
           this.img.src = images_urls.right_pos_player[0]/*повернуться, даже если упрёмся в стену*/
           this.direction = 'right' /*изменить направление движения на нужное*/
           if (this.x < canvas.width - 71 - this.speed)/*проверка на то, чтобы не выйти из канваса*/{
             this.x += this.speed/*переместиться на скорость точек в канвасе вправо*/
             this.img.src = images_urls.right_pos_player[this.animCounter]
             if(this.animCounter+1 < images_urls.right_pos_player.length)/*если анимашки ещё не закончились*/{
               this.animCounter++
             }
             else/*иначе(если анимашки закончились)*/{
               this.animCounter = 0;/*сбросить счётчик анимашек*/
             }
           } else /*иначе просто повернуться(сменить картинку на стоячую, где не двигаются гусеницы)*/{this.img.src = images_urls.right_pos_player[0]}
         }
       }
   }/*да, да, игрок это объект а не класс, да, это говнокод, но мне похер, игра то моя и простенькя*/
 player.img.src = images_urls.up_pos_player[0] /*путь к танку(по умолчанию он стоит прямо)*/


let objects = new Array(player) //Массив игровых объектов
let bullets_ar = new Array() //Массив с пулями



class Bullets/*класс с НЕУНИЧТОЖЕННЫМИ ПУЛЯМИ!!!! Уничтоженные */{
   static demage_bullet = 10;/*у всех пулек будет такой урон*/
   constructor() {
     this.Size = {/*размеры пули(картинки пули)(разрешение картинки, на которой только пуля)*/
       width: 16,
       height: 16
     }
     this.animCounterBulet = 0; /* на будующее для анимирования */
     this.img = new Image() /*создание свойчтво img(у всего класса оно конечно одно, но это говнокод, а потому оно динамическое и принадлежит конкретной пуле, к тому же, можно будет потом анимировать взрыв пули тип)*/
     this.img.src = images_urls.bullet_all[0] /*путь к файлу с картинкой пули*/
     this.direction = player.direction /*направление движения как у игрока(т.к. башня не крутится)*/
     player.shooted++ /*счётчик выстрелов у игрока(надо оно мне)*/
     this.speed = player.speed*bullet_speed_in_gamer_speed /*Скорость пули(я выставляю в скоростях игрока умноженых на что-то)*/
     this.destroid = false /*уничтожена ли пуля?*/
     this.demage = Bullets.demage_bullet /*урон потециальным врагам*/
     switch (this.direction){/*Начальная позиция относительно игрока в зависимости от направления движения игрока(без этого пули спавнятся не всегда у пушки танка)*/
       case "top":
       this.x = player.x + 78/2 - 7
       this.y = player.y - 15
       break;

       case "left":
       this.x = player.x - 15
       this.y = player.y + 77/2 - 8
       break;

       case "right":
       this.x = player.x + 78
       this.y = player.y + 77/2 - 8
       break;

       case "back":
       this.y = player.y + 77
       this.x = player.x + 78/2 - 9
       break;
     }
   }
   fly(){/*метод, двигающий пулю куда-то в зависимости от направления, которое нельзя менять НИКАК!!! Только 1 раз в конструкторе при появлении пули*/
     switch (this.direction){
       case "top":
       this.goForward()
       break;

       case "left":
       this.goLeft()
       break;

       case "right":
       this.goRight()
       break;

       case "back":
        this.goBack()
       break;
     }
     //setTimeout(this.fly(), 1000/60);
   }
   goLeft(){/*Метод конкретной пули, двигающий её влево*/
     this.x -= this.speed
     if(this.x < -10)  //если выходит за пределы канваса
       {this.destroid = true}
   }
   goRight(){/*Метод конкретной пули, двигающий её вправо*/
     this.x += this.speed
     if(this.x > canvas.width+10)
       {this.destroid = true}
   }
   goForward(){/*Метод конкретной пули, двигающий её вперёд(вверх)*/
     this.y -= this.speed
     if(this.y < -10)
       {this.destroid = true}
   }
   goBack(){ /*Метод конкретной пули, двигающий её назад(вниз)*/
     this.y += this.speed
     if(this.y > canvas.height+10)
       {this.destroid = true}
   }
   animateDestroing(){/*Ничего пока тут нету, а вообще это порядок уничтожения пули(анимации)*/}
 }
class Destroid_bullets/*класс уничтоженных пулек*/ {
   constructor() {
     this.destroid = true; /*чтобы потом в цикле отрисовки не рисовать такие пули*/
     this.speed = 0 - 10; /*она меньше нуля для идентефикации пули как уничтоженной*/
   }
 }

class Wall/*Класс стен. Всех цветов. Дочерних классов не будет наверное, всё будет в этом*/{
  static couterDestroidWall = 0;
  constructor(color,x,y){
     this.x = x
     this.y = y
     this.destroid = false
     this.img = new Image() //нужно указать путь к файлу после
     this.hp = Bullets.demage_bullet*3/*Сколько хп изначально(у пуди дамаг 10, то есть сломает её 3 пули, соотношение всегда должно быть таким)*/
     this.destroid = false/*Уничтожена ли стена?*/

     switch(color)/*присваивание свойству цвет цифрового значения(индекса в массиве) в зависимости от строкового*/{
       case "red" :  this.color = 0; /*индекс кортинки в 1-ом измерении массива(0 - красный цвет)*/ break;
       case "blue" : this.color = 1;/*индекс кортинки в 1-ом измерении массива(1 - синий цвет)*/ break;
     }
     setInterval(chekDestroing(), 1000/120)/*интервал в 2 раза больше кол-ва кадров чтобы точно успеть между кадрами всё проверить*/
   }
   destroing(){
     this.destroid = true
     this.img = new Image()
     this.hp = 0
     Wall.couterDestroidWall++
     this.animateDestroing()
   }
   animateDestroing(){
     /*что делать(из визуала) при уничтожении стены?*/
   }
  chekDestroing(){/*проверка того, не попала ли в стену пуля*/
      for (var i = 0; i < bullets_ar.length; i++) {
       switch(bullets_ar[i].direction){
         case 'top'/*СНИЗУ ВВЕРХ*/:
         if((bullets_ar[i].y - (bullets_ar[i].Size.hieght/2) - (this.Size.hieght/2) == this.y - (this.this.Size.hieght/2)/*если y  совпадает*/) && ((bullets_ar[i].x >= this.x-(this.Size.width/2))&&(bullets_ar[i].x <= this.x+(this.Size.width/2) )/*если x совпадает*/ ) ) {
           this.hp -= bullets_ar[i].demage;
           if(this.hp <= 0){
             this.destroid = true
             this.destroing()
           }
         }
         break;

         case 'left'/*СПРАВА НАЛЕВО*/:
        break;

         case 'right'/*СЛЕВА НАПРАВО*/:if((bullets_ar[i].x - (bullets_ar[i].Size.width/2) - (this.Size.width/2) == this.x - (this.this.Size.hieght/2)/*если x  совпадает*/) && ((bullets_ar[i].y >= this.y-(this.Size.height/2))&&(bullets_ar[i].x <= this.x+(this.Size.height/2) )/*если y совпадает*/ ) ) {

         }
         break;

         case 'back'/*СВЕРХУ ВНИЗ*/:
         break;
       }
     }
   }
 }

 window.addEventListener("keydown", (e) => {KeyDown(e)}) /*Получение нажатий с клавиатуры*/



 function Start(){
     let timer = setInterval(Update, 1000 / 60) //Состояние игры будет обновляться 60 раз в секунду — при такой частоте обновление происходящего будет казаться очень плавным
 }

 function Stop(){
     clearInterval(timer) //Остановка обновления
 }

 function Update() /*Обновление игры*/ {
     Draw();
 }

 function Draw() /*Работа с графикой*/ {
     gameZone.clearRect(0, 0, canvas.width, canvas.height); /*Очистка холста от предыдущего кадра*/
     for (let i = 0; i < objects.length; i++) {  /*цикл для всего кроме пуль(пока только для игрока, потом и для стен и т.п.)*/
       gameZone.drawImage(objects[i].img, objects[i].x , objects[i].y)   /**/
     }
     for (let j = 0; j < bullets_ar.length; j++) { /*цикл ТОЛЬКО для пуль*/
       if(bullets_ar[j].destroid)/*если пуля уничтожена*/{
         bullets_ar[j] = new Destroid_bullets()/*новый объект класса с свойством: уничтожен = true(чтобы в след. раз в этом же цикле его не посчитали за пулю, а в значении destroid не было undefined)*/
         j++   /*этот объект(уничтоженную пулю) не станут рассматривать как пулю далее в цикле*/
       }
       if((bullets_ar[j].speed >= 0)&&(j < bullets_ar.length)/*ну а тут проверка j опять, а то вдруг пуля, последняя в этом массиве и уничтожена? тогда j = кол-во пуль, а это уже ошибка(в массиве индексы же от ноля)*/)/*проверяем пулю на уничтоженность по скорости(у нормальной пули она ВСЕГДА больше или равна нолю, в коде НЕТ её уеньшений меньше ноля и т.п.)*/ {
         bullets_ar[j].fly()/*все пули летят*/ /*какая-то ошибка, но пули летят, значит её можно игнорировать(она вообще никак не влияет)*/
         gameZone.drawImage(bullets_ar[j].img, bullets_ar[j].x , bullets_ar[j].y)   /*отрисовать все пули(кроме уничтоженных)*/
       }
     }

 }

 function KeyDown(e)/*если какая-то клавиша была нажата, вызывается эта функция(смотри код выше)(там где window.addEventListener и т.д.)*/{
     switch(e.keyCode)/*проверка кода нажатой клавиши на совпадение с кодами управляющих*/{
         case keys.left: /*Влево*/
         player.goLeft()/*двигаться влево*/
             break;

         case keys.right : /*Вправо*/
         player.goRight()
             break;

         case keys.forward : /*Вверх*/
         player.goForward()
             break;

         case keys.back: /*Вниз*/
         player.goBack()
             break;

         case keys.shoot: /*выстрел*/
         if (!player.Shooted_recently)/*не стрелял ли игрок недавно? Если нет, то...*/{
           let pylka = new Bullets()
           bullets_ar[bullets_ar.length] = pylka // добавить новую пулю в объекты}
           player.Shooted_recently = true/*игрок недавно выстрелил*/
           timerok = setTimeout(() => {player.Shooted_recently = false} , 1000/player.fireRate)/*вернуть возможность игроку стрелять через время: секнда(1000 милисекунд)/скорострельность(в секунду)*/
         }
         break;
         /*
         можно конечно при повороте обнулять счётчик анимашек, чтобы можно было анимировать игрока в разное кол-во кадров, но я такого делать не стану, т.к. крайне неестественнен резкий переход при повороте в стартовое положение(но зато если будет разное кол-во кадров, при повороте игрок может временно исчезнуть, т.к. елемента с индексом animCounter в другом массиве может не быть(в другом массиве с путями к картинкам))
 */
     }
 }



 Start()
