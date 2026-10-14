#include <bits/stdc++.h>
#include <windows.h> 
#include <conio.h>
 
using namespace std;
 
void ccc(); // 匀速输出 
void c_slow(); // 缓慢输出 
void cls(); // 清屏 
void Error(); // 输出"Input Error" 
void zhuye(); // 主界面 
void inti(); // 初始化 
 
long long money;
long long bing_1,bing_2 = 1,bing_3;
long long my_shili;
 
void ccc(string s) { // 匀速输出 
	for(int i = 0; i < s.size(); i++) {
		cout << s[i];
		Sleep(25);
	}
	printf("\n");
}
 
void c_slow(string s) { // 缓慢输出 
	for(int i = 0; i < s.size(); i++) {
		cout << s[i];
		Sleep(444);
	}
	printf("\n");
}
 
void cls() { // 清屏 
	system("cls");
}
 
void Error() { // 输出"Input Error" 
	cls();
	c_slow("Input Error!");
	zhuye();
}
 
void zhuye() { // 主界面 
	cls();
	ccc("1.说明 2.商店 3.征战 4.我的资料 5.礼包码");
	char s = getch();
	if(s == '1') {
		cls();
		ccc("版本号: v.1.06 ");
		ccc("征战获得钱");
		ccc("钱买士兵");
		ccc("按任意键继续");
		char a = getch();
		zhuye();
	} else if(s == '2') {
		cls();
		ccc("1.普通士兵 10 元 一个 2. 中级士兵 66 元一个 3.高级士兵 111元一个 4.返回");
		char a = getch();
		if(a == '4') zhuye();
		if(a == '1') {
			ccc("输入个数");
			printf("你有%lld元",money);
			int num;
			cin >> num;
			if(money >= num * 10) {
				money -= num * 10;
				bing_1 += num;
				ccc("购买成功！");
				zhuye();
			} else Error(); 
		}
		if(a == '3') {
			ccc("输入个数");
			printf("你有%lld元",money);
			int num;
			cin >> num;
			if(money >= num * 111) {
				money -= num * 111;
				bing_3 += num;
				ccc("购买成功！");
				zhuye();
			} else Error();
		}
		if(a == '2') {
			ccc("输入个数");
			printf("你有%lld元",money);
			int num;
			cin >> num;
			if(money >= num * 66) {
				money -= num * 66;
				bing_2 += num;
				ccc("购买成功！");
				zhuye();
			} else Error();
		}
	} else if(s == '3') {
		cls(); 
		my_shili = bing_1 * 3 + bing_2 * 10 + bing_3 * 30; 
		printf("我方战力：%lld\n",my_shili);
		ccc("输入敌人等级(1 ~ 50)");
		int num; cin >> num;
		if(num < 1 || num > 50) Error();
		long long di_shili = pow(2,num);
		while(1){
			if(di_shili <= 0) {
				cls();
				ccc("You Win!");
				money += pow(3,num);
				printf("你获得了");
				cout << pow(3,num);
				printf("元！\n");
				Sleep(1000);
				zhuye(); 
			} if(my_shili <= 0) {
				cls(); 
				ccc("你全军覆没了！");
				Sleep(1000);
				ccc("你在混乱中被杀");
				cls();
				c_slow("You Are Die!");
				Sleep(500);
				inti();
			}
			printf("敌方战力：%lld\n",di_shili);
			printf("我方战力：%lld\n",my_shili);
			ccc("1.攻击 2.逃跑");
			char a = getch();
			if(a == '2') zhuye();
			if(a == '1') {
				if(my_shili >= di_shili) {
					bing_1 = ceil(bing_1 * 1.0 / 1.5);
					bing_2 = ceil(bing_2 * 1.0 / 1.25);
					bing_3 = ceil(bing_3 * 1.0 / 1.125);
					my_shili = bing_1 * 3 + bing_2 * 10 + bing_3 * 30;
					di_shili /= 3;
				} else {
					bing_1 /= 2.5;
					bing_2 /= 2;
					bing_3 /= 1.5;
					my_shili = bing_1 * 3 + bing_2 * 10 + bing_3 *30;
					di_shili /= 1.5;
				}
			}
		}
	} else if(s == '4') {
		cls();
		printf("金币：%lld\n", money);
		printf("普通士兵：%lld\n", bing_1);
		printf("中级士兵：%lld\n", bing_2);
		printf("高级士兵：%lld\n", bing_3);
		printf("战力值：%lld\n", bing_1 * 3 + bing_2 * 10 + bing_3 * 30);
		ccc("按任意键继续");
		char a = getch(); zhuye();
	} else if(s == '5') {
		cls();
		ccc("输入兑换码");
		string a; getline(cin,a);
		if(a == "HAPPY666") {
			cls();
			ccc("恭喜获得：2000000000000000000000元");
			money += 2000000000000000000000;
			Sleep(500);
			zhuye();
		} if(a == "School666") {
			cls();
			ccc("恭喜获得：999999名中级士兵");
			bing_2 += 999999;
			Sleep(500);
			zhuye(); 
		} if(a == "C++666") {
			cls();
			ccc("恭喜获得：666666666666名高级士兵");
			bing_3 += 6666666666666;
			Sleep(500);
			zhuye();
		} if(a == "DevC++666") {
			cls();
			ccc("恭喜获得：100000000000000名低级士兵");
			bing_1 += 100000000000000;
			Sleep(500);
			zhuye(); 
		} else Error();
	} else Error();
}
 
void inti() { // 初始化 
	cls();
	system("color 09");
	c_slow("By School");
	Sleep(500);
	cls();
	c_slow("Loading……");
	Sleep(500);
	zhuye();
} 
 
int main() { inti(); } // main()函数好像没用…… 


