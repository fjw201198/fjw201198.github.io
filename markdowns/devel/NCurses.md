# NCurses

[TOC]

[参考连接](http://www.tldp.org/HOWTO/NCURSES-Programming-HOWTO)

## 1 初始化函数

### 1.1 raw(), cbreak() 行缓冲

raw()和cbreak()用来禁用行缓冲。通常终端驱动会缓冲用户输入的字符直到遇到换行符。

raw()和cbreak()的区别在于 **控制字符** (如CTRL-C) 的处理，使用raw()时，控制字符会直接传给应用程序而不会生成一个信号（SIGINT）。而cbreak()会被其他打断。

### 1.2 echo(), noecho() 回显

echo()和noecho()用来控制输入回显。noecho()用来关闭回显。

### 1.3 keypad() 功能键F1, F2, ...

keypad()控制是否读取功能键。如：`keypad(stdscr, TRUE)`。

### 1.4 halfdelay() 半延迟

该函数不常用。如果在设定的时间内无输入，则会返回错误。

### 1.5 例子

```c
#include <ncurses.h>

int main()
{	int ch;

	initscr();			/* Start curses mode 		*/
	raw();				/* Line buffering disabled	*/
	keypad(stdscr, TRUE);		/* We get F1, F2 etc..		*/
	noecho();			/* Don't echo() while we do getch */

    printw("Type any character to see it in bold\n");
	ch = getch();			/* If raw() hadn't been called
					 * we have to press enter before it
					 * gets to the program 		*/
	if(ch == KEY_F(1))		/* Without keypad enabled this will */
		printw("F1 Key pressed");/*  not get to us either	*/
					/* Without noecho() some ugly escape
					 * charachters might have been printed
					 * on screen			*/
	else
	{	printw("The pressed key is ");
		attron(A_BOLD);
		printw("%c", ch);
		attroff(A_BOLD);
	}
	refresh();			/* Print it on to the real screen */
    getch();			/* Wait for user input */
	endwin();			/* End curses mode		  */

	return 0;
}
```



## 2 输出函数

### 2.1 addch() 类函数

addch() 类函数，有属性的打印单个字符。

在当前光标处放字符，并更新当前光标位置。

有两种方法结合属性：

-   通过将单个字符**或**上相关属性的宏。

    ```c
    addch(ch | A_BOLD | A_UNDERLINE);
    ```

-   通过使用attr函数,如attrset(),attron(),attroff().

### 2.2 mvaddch(), waddch(), mvwaddch()

mvaddch() 用来将光标移到指定的位置，然后打印。因此，下面的调用：

```c
move(row, col);
addch(ch);
```

等同于:

```c
mvaddch(row, col, ch);
```

waddch() 和addch相似，用来将字符添加到指定Window中。addch()只是添加到stdscr window中。

mvwaddch()函数用来将字符添加到window的指定位置。

### 2.3 printw()类函数

printw() 类函数，像printf()那样格式化的输出。

-   printw() & mvprintw()

-   wprintw() & mvwprintw()

-   vwprintw()

    类似于`vprintf()`

### 2.4 addstr()

addstr()类函数，打印字符串。

-   addstr()
-   mvaddstr()
-   mvwaddstr()
-   waddstr()

### 2.5 例子

```c
#include <ncurses.h>			/* ncurses.h includes stdio.h */  
#include <string.h> 
 
int main()
{
 char mesg[]="Just a string";		/* message to be appeared on the screen */
 int row,col;				/* to store the number of rows and *
					 * the number of colums of the screen */
 initscr();				/* start the curses mode */
 getmaxyx(stdscr,row,col);		/* get the number of rows and columns */
 mvprintw(row/2,(col-strlen(mesg))/2,"%s",mesg);
                                	/* print the message at the center of the screen */
 mvprintw(row-2,0,"This screen has %d rows and %d columns\n",row,col);
 printw("Try resizing your window(if possible) and then run this program again");
 refresh();
 getch();
 endwin();

 return 0;
}
```



## 3. 输入函数

-   getch()类：获取单个字符
-   scanw()类：获取格式化的输入
-   getstr()类，获取字符串

### 3.1 getch()类函数

用来从终端读取单个字符。如果没用禁用行缓存(cbreak())，getch不会读取字符，指导遇到了换行或EOF。

### 3.2 scanw()类函数

scanw()和`scanf`类似

-   scanw(), mvscanw

-   wscanw(), mvwscanw()

-   vwscanw()

    和`vscanf()`类似

### 3.3 getstr()

从终端获取字符串。

### 3.4 例子

```c
#include <ncurses.h>			/* ncurses.h includes stdio.h */  
#include <string.h> 
 
int main()
{
 char mesg[]="Enter a string: ";		/* message to be appeared on the screen */
 char str[80];
 int row,col;				/* to store the number of rows and *
					 * the number of colums of the screen */
 initscr();				/* start the curses mode */
 getmaxyx(stdscr,row,col);		/* get the number of rows and columns */
 mvprintw(row/2,(col-strlen(mesg))/2,"%s",mesg);
                     		/* print the message at the center of the screen */
 getstr(str);
 mvprintw(LINES - 2, 0, "You Entered: %s", str);
 getch();
 endwin();

 return 0;
}
```



## 4 属性

属性：

```c
    A_NORMAL        Normal display (no highlight)
    A_STANDOUT      Best highlighting mode of the terminal.
    A_UNDERLINE     Underlining
    A_REVERSE       Reverse video
    A_BLINK         Blinking
    A_DIM           Half bright
    A_BOLD          Extra bright or bold
    A_PROTECT       Protected mode
    A_INVIS         Invisible or blank mode
    A_ALTCHARSET    Alternate character set
    A_CHARTEXT      Bit-mask to extract a character
    COLOR_PAIR(n)   Color-pair number n 
```

可以通过`|`来结合

### 4.1 attron(), attrset(),attroff

attrset用来设置属性，而attrcon只是用来打开属性。因而attrset可以设置任何属性。类似的，attroff用来关闭属性。

### 4.2 attr_get()

attr_get()用来获取当前属性和颜色对。通常被用来扫描屏幕区域。

### 4.3 attr_ 函数

这是一系列的函数，例如attr_set(), attr_on()等。和上面的函数相似，只是attr_ 系列函数使用attr_t类型的参数。

### 4.4 wattr 函数

和上面的函数相似，带'w'前缀的用来操作Window。

### 4.5 chgat(), mvchat()

chgat()用来修改属性，而不用移动光标。

-   wchgat(), mvchgat(), mvchgat()

### 4.6 例子

```c
#include <ncurses.h>

int main(int argc, char *argv[])
{	initscr();			/* Start curses mode 		*/
	start_color();			/* Start color functionality	*/
	
	init_pair(1, COLOR_CYAN, COLOR_BLACK);
	printw("A Big string which i didn't care to type fully ");
	mvchgat(0, 0, -1, A_BLINK, 1, NULL);	
	/* 
	 * First two parameters specify the position at which to start 
	 * Third parameter number of characters to update. -1 means till 
	 * end of line
	 * Forth parameter is the normal attribute you wanted to give 
	 * to the charcter
	 * Fifth is the color index. It is the index given during init_pair()
	 * use 0 if you didn't want color
	 * Sixth one is always NULL 
	 */
	refresh();
    getch();
	endwin();			/* End curses mode		  */
	return 0;
}
```



## 5 Window







