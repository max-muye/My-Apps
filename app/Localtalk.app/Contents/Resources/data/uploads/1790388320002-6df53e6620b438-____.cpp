#include<bits/stdc++.h>
#include<unistd.h>
#include<stdlib.h>
#include<windows.h>
using namespace std;
int input = 0;
int wood = 0;
int stone = 0, iron = 0, copper = 0, sliver = 0, gold = 0;
int crimtane = 0;							
int life = 100,life2;
int attack = 15, defense = 0;
int coin = 0;
int mine = 0;
int resentment = 0;
int ci = 0;	
int kan = 0;	
int mode = 0;
int palladium = 0;
int chlorophyte = 0;
void wait(int time){
	clock_t now = clock();
	while(clock() - now < time);
}
void start(){
	string l;
	cout << "是否跳过剧情？如要跳过，回答1" << endl;
	cin >> l;
	if(l == "1") return; 
	cout << "[你，是村子里的一个家财万贯的人]" << endl;
	wait(1000);
	cout << "[有一天，你在村里散步时，突然被一个人给打了]" << endl;
	wait(1000);
	system("color C0");
	system("color 0F");
	cout << "[“什么人，还敢在我面前出现”]" << endl;
	wait(1000);
	cout << "[你感到头晕目眩]" << endl;
	wait(1000);
	cout << "[醒来后你发现你身上什么也没有了]" << endl;
	wait(1000);
	cout << "[你环顾四周，发现你在一座巨大的海岛上，附近除了一个矿洞，一个村庄和一片小树林，什么也没有]" << endl;
	wait(1000);
	cout << "[没办法，你为了活下去，只能在上面生存，直到有人救你]" << endl;
	wait(1000); 
	cout << "[于是，一场海岛的生存]" << endl;
	wait(1000);
	cout << "[正式开始]" << endl;
	wait(1000);
}
void jm(){ 
	system("cls");
	cout << "-- -- -- 海岛生存v1.2.6.1 -- -- --" << endl; 
	cout << "这是一个物资贫瘠的海岛，这里面有一片小树林和一个矿洞，以及一个村庄" << endl;
	cout << "你想要做什么?" << endl;
	cout << "1,去小树林砍树" << endl;
	cout << "2,下矿(可能会遇到怪物)" << endl;
	cout << "3,去村子里抢劫(可以获得金币以及食物)" << endl;
	cout << "4,制作武器与装备(加攻击与防御)" << endl;
	cout << "5,找商人买东西" << endl;
	if(mode == 0){
		cout << "6,去打克苏鲁之眼(boss)" << endl;
		cout << "7,去打克苏鲁之脑(boss)" << endl;
		cout << "8,去打骷髅队长(boss)" << endl;
		cout << "9,去打血肉之墙(大BOSS)" << endl;
	}
	else if(mode == 1){
		cout << "6,去打双子魔眼(boss)" << endl;
		cout << "7,去打毁灭者(boss)" << endl;
		cout << "8,去打机械骷髅王(boss)" << endl;
		cout << "9,去打奥库瑞姆(大BOSS)" << endl;		
	}
	else if(mode == 2){
		cout << "6,去打世纪之花(boss)" << endl;
		cout << "7,去打瘟疫使者歌莉娅(boss)" << endl;
		cout << "8,去打痴愚金龙(boss)" << endl;
		cout << "9,去打丛林龙(大BOSS，奉劝你一句，不要随便打)" << endl;				
	}
	else if(mode == 3){
		cout << "6,去打白金星舰(boss)" << endl;
		cout << "7,去打星神游龙(boss)" << endl;
		cout << "8,去打亵渎守卫(boss)" << endl;
		cout << "9,去打亵渎天神-普罗维登斯(大BOSS，我最后再奉劝你一句，不要随便打)" << endl;						
	} 
	cout << "10,去刷怪(随机的怪物)" << endl;
	cout << "11,显示自己的状态" << endl;
	cout << "12,退出游戏" << endl;
	while(1){
		cin >> input;
		if(input == 1){
			if(kan <= 35){
				cout << "砍树砍到了1块木头" << endl;
				wood += 1;
				kan++;
			}
			else{
				cout << "这片小树林已经被你砍光了！" << endl;
			}
			system("pause");
			system("cls");
			jm();
		}
		else if(input == 2){
			system("cls");
			int _ = rand()%2;
			cout << "正在挖矿……" << endl;
			sleep(2); 
			if(mine < 10){
				_ = rand()%2;
				if(_ == 0){
					cout << "这次挖矿没有遇到任何怪物!" << endl;
				}
				else{
					if(mode == 0){ 
						life2 = 40;
						_ = 0;
						cout << "这回你运气不好，遇到了一只骷髅！" << endl;
						if(resentment != 0){cout << "骷髅因为怨念被增强了！" << endl; life2 += resentment/2;}
						cout << "骷髅详情：" << endl << "生命：40 " << "攻击：10 " << "防御：0" << endl;
						while(life || life2){
							cout << "请做出你的选择：\n1,干！" << endl;
							cin >> _;
							if(_ == 1){
								cout << "你向骷髅发起了攻击!" << endl;
								wait(200);
								system("color C0");
								life2 -= attack;
								wait(200);
								system("color 0F");
								cout << "你对骷髅造成了" << attack << "点伤害！" << endl;
								if(life2 <= 0){
									cout << "骷髅被你击败了！你获得了5个金币！……但增加了30点怨念" << endl;
									coin += 5;
									ci++;
									resentment += 30;
									wait(1000);
									break; 
								} 
								cout << "骷髅还剩" << life2 << "点生命！" << endl;
								wait(200);
								cout << "骷髅发起了反击!" << endl;
								wait(200);
								system("color C0");
								_ = 10 - defense;
								if(_ < 1) _ = 1;
								life -= _;
								wait(200);
								system("color 0F");
								cout << "骷髅打掉了你" << _ << "点生命！" << endl;
								if(life <= 0){
									cout << "你被杀死了!" << endl;
									wait(1000);
									cout << "等待复活……" << endl;
									wait(1000);
									life = 100; 
									jm();
								}
								cout << "你还有" << life << "点生命" << endl;
								system("pause");
								system("cls");
								continue;
							}
							else{
								cout << "别乱选啊" << endl;
								continue;
							}
						}
					}
					else if(mode == 1 || mode == 2){
						life2 = 150;
						_ = 0;
						cout << "这回你运气不好，遇到了一只装甲骷髅！" << endl;
						if(resentment != 0){cout << "装甲骷髅因为怨念被增强了！" << endl; life2 += resentment/2;}
						cout << "骷髅详情：" << endl << "生命：150 " << "攻击：120 " << "防御：30" << endl;
						while(life || life2){
							cout << "请做出你的选择：\n1,干！" << endl;
							cin >> _;
							if(_ == 1){
								cout << "你向装甲骷髅发起了攻击!" << endl;
								wait(200);
								system("color C0");
								_ = attack - 30;
								if(attack < 1) _ = 1;
								life2 -= _;
								wait(200);
								system("color 0F");
								cout << "你对装甲骷髅造成了" << attack << "点伤害！" << endl;
								if(life2 <= 0){
									cout << "装甲骷髅被你击败了！你获得了15个金币！……但增加了50点怨念" << endl;
									coin += 15;
									ci++;
									resentment += 50;
									wait(1000);
									break; 
								} 
								cout << "装甲骷髅还剩" << life2 << "点生命！" << endl;
								wait(200);
								cout << "装甲骷髅发起了反击!" << endl;
								wait(200);
								system("color C0");
								_ = 80 - defense;
								if(_ < 1) _ = 1;
								life -= _;
								wait(200);
								system("color 0F");
								cout << "装甲骷髅打掉了你" << _ << "点生命！" << endl;
								if(life <= 0){
									cout << "你被杀死了!" << endl;
									wait(1000);
									cout << "等待复活……" << endl;
									wait(1000);
									life = 100;
									jm();
								}
								cout << "你还有" << life << "点生命" << endl;
								system("pause");
								system("cls");
								continue;
							}
							else{
								cout << "别乱选啊" << endl;
								continue;
							}
						}						
					}					
				}
			}
			else if(rand() % 3 == 0){
				system("cls"); 
				if(mode == 0){
					life2 = 1400;
					int cnt = 0;
					int temp = 1;
					cout << "恭喜你遇到了作者附赠的隐藏boss——菌生蟹！" << endl;
					if(resentment != 0){cout << "菌生蟹因为怨念被增强了！" << endl; life2 += resentment/2;}
					cout << "菌生蟹详情：" << endl << "生命：1400 " << "攻击：120(霉菌伤害10) " << "防御：80" << endl;
					while(life|| life2){
						cout << "请做出你的选择\n1，干！" << endl;
						int _;
						cin >> _;
						if(_ == 1){
							cout << "你向菌生蟹发起了攻击！" << endl;
							wait(200);
							system("color C0");
							wait(200);
							system("color 0F");
							_ = attack - 80;
							if(_ < 1) _ = 1;
							life2 -= _;
							cout << "你对菌生蟹造成了" << _ << "点伤害！" << endl;
							wait(200);
							cout << "菌生蟹还剩" << life2 << "点生命！" << endl;
							if(life2 < 1){
								cout << "菌生蟹被你击败了！你真厉害！" << endl;
								wait(1000);
								cout << "你获得了30枚金币！防御力恢复了！生命值增加了50点！并获取了8个去村庄抢劫的次数！还获得了60个金矿！……但你的怨念也增加了150点" << endl;
								wait(1000);
								coin += 30;
								life += 50;
								ci += 8;
								gold += 60; 
								defense += cnt * 5; 
								resentment += 150;
								system("pause");
								system("cls");
								jm();
							}
							if(life2 <= 700 && temp == 1){
								cout << "菌生蟹进入了第二阶段！" << endl;
								temp = 2;
							}
							_ = rand() % 2;
							wait(200);
							if(temp == 1){
								if(_ != 0){
									cout << "菌生蟹对你使用了重压！" << endl;
									wait(200);
									system("color C0");
									wait(200);
									system("color 0F");
									wait(200);
									_ = 90 - defense;
									if(_ < 1) _ = 1;
									life -= _;
								}
								else{
									cout << "菌生蟹对你使用了霉菌攻击！" << endl;
									wait(200);
									system("color F0");
									wait(200);
									system("color 0F");
										wait(200);
										_ = 10 - defense;
										if(_ < 1) _ = 1;
										life -= _;
										cnt++;
										cout << "你被霉菌侵蚀了！防御力降低了5点！" << endl;
										defense -= 5; 
									}
								}
							else{
								_ = rand()%2;
								if(_ != 0){
									cout << "菌生蟹对你使用了夹击！" << endl;
									wait(200);
									system("color C0");
									wait(200);
									system("color 0F");
									wait(200);
									_ = 120 - defense;
									if(_ < 1) _ = 1;
									life -= _;
								}
								else{
									_ = rand() % 3 + 1; 
									cout << "菌生蟹对你发射了" << _ << "个霉菌团！" << endl;
									wait(200);
									system("color F0");
									wait(200);
									system("color 0F");
									wait(200);
									cnt += _ * 5;
									defense -= _ * 5;
									_ = 10 * 2 * _ - defense;
									if(_ < 1) _ = 1;
									life -= _; 
									cout << "你被霉菌侵蚀了！防御力降低了" << _ * 5 << "点！" << endl;
								} 
							}
							if(life < 1){
								cout << "你被菌生蟹击败了！" << endl;
								wait(1000);
								cout << "等待复活……" << endl;
								wait(1000);
								life = 100;
								defense += cnt * 5;
								jm();
							}
							cout << "你受到了" << _ << "点伤害!" << endl;
							wait(200);
							cout << "你还剩" << life << "点生命！" << endl;
							system("pause");
							system("cls");
						}
						else{
							cout << "你别乱选！这可是作者附赠boss！" << endl;
							system("pause");
							system("cls");
							continue;
						}
					}	
				}
				else{
					life2 = 10000;
					int cnt = 0;
					int temp = 1;
					cout << "恭喜你遇到了作者附赠的隐藏boss(困难模式)——猩红菌生蟹！" << endl;
					if(resentment != 0){cout << "菌生蟹因为怨念被增强了！" << endl; life2 += resentment/2;}
					cout << "猩红菌生蟹详情：" << endl << "生命：10000 " << "攻击：200(霉菌伤害30) " << "防御：300" << endl;
					while(life|| life2){
						cout << "请做出你的选择\n1，干！" << endl;
						int _;
						cin >> _;
						if(_ == 1){
							cout << "你向猩红菌生蟹发起了攻击！" << endl;
							wait(200);
							system("color C0");
							wait(200);
							system("color 0F");
							_ = attack - 300;
							if(_ < 1) _ = 1;
							life2 -= _;
							cout << "你对猩红菌生蟹造成了" << _ << "点伤害！" << endl;
							wait(200);
							cout << "猩红菌生蟹还剩" << life2 << "点生命！" << endl;
							if(life2 < 1){
								cout << "猩红菌生蟹被你击败了！你真厉害！" << endl;
								wait(1000);
								cout << "你获得了110枚金币！防御力恢复了！生命值增加了80点！并获取了10个去村庄抢劫的次数！……但你的怨念也增加了250点" << endl;
								wait(1000);
								coin += 110;
								life += 80;
								ci += 10;
								defense += cnt * 6; 
								resentment += 250;
								system("pause");
								system("cls");
								jm();
							}
							if(life2 <= 5000 && temp == 1){
								cout << "猩红菌生蟹进入了第二阶段！" << endl;
								temp = 2;
							}
							_ = rand() % 2;
							wait(200);
							if(temp == 1){
								if(_ != 0){
									cout << "猩红菌生蟹对你使用了重压！" << endl;
									wait(200);
									system("color C0");
									wait(200);
									system("color 0F");
									wait(200);
									_ = 180 - defense;
									if(_ < 1) _ = 1;
									life -= _;
								}
								else{
									cout << "猩红菌生蟹对你使用了霉菌攻击！" << endl;
									wait(200);
									system("color F0");
									wait(200);
									system("color 0F");
										wait(200);
										_ = 30 - defense;
										if(_ < 1) _ = 1;
										life -= _;
										cnt++;
										cout << "你被霉菌侵蚀了！防御力降低了8点！" << endl;
										defense -= 8; 
									}
								}
							else{
								_ = rand()%2;
								if(_ != 0){
									cout << "猩红菌生蟹对你使用了夹击！" << endl;
									wait(200);
									system("color C0");
									wait(200);
									system("color 0F");
									wait(200);
									_ = 250 - defense;
									if(_ < 1) _ = 1;
									life -= _;
								}
								else{
									_ = rand() % 3 + 1; 
									cout << "猩红菌生蟹对你发射了" << _ << "个霉菌团！" << endl;
									wait(200);
									system("color F0");
									wait(200);
									system("color 0F");
									wait(200);
									cnt += _ * 8;
									defense -= _ * 8;
									_ = 30 * 2 * _ - defense;
									if(_ < 1) _ = 1;
									life -= _; 
									cout << "你被霉菌侵蚀了！防御力降低了" << _ * 8 << "点！" << endl;
								} 
							}
							if(life < 1){
								cout << "你被猩红菌生蟹击败了！" << endl;
								wait(1000);
								cout << "等待复活……" << endl;
								wait(1000);
								life = 100;
								defense += cnt * 8;
								jm();
							}
							cout << "你受到了" << _ << "点伤害!" << endl;
							wait(200);
							cout << "你还剩" << life << "点生命！" << endl;
							system("pause");
							system("cls");
						}
						else{
							cout << "别乱选！这可是作者附赠boss！" << endl;
							system("pause");
							system("cls");
							continue;
						}
					}						
				}				
			}
			int n = rand()%5 + 8;
			cout << "你挖到了" << n << "块石头，";
			stone += n;
			n = rand()%13 + 1;
			cout << n << "块铜矿，";
			copper += n;
			n = rand()%11;
			cout << n << "块铁矿，";
			iron += n;
			n = rand()%11;
			cout << n << "块银矿，";
			sliver += n;
			n = rand()%6;
			cout << n << "块金矿，";
			gold += n;
			if(mode != 0){
				n = rand()%10+3;
				cout << n << "块钯金矿";
				palladium += n;
			}
			if(mode >= 2){
				n = rand()%10+1;
				cout << n << "块叶绿矿";
				chlorophyte += n;
			} 
			cout << endl;
			mine++;
			cout << "你总共下矿了" << mine << "次" << endl;
			system("pause");
			system("cls");
			jm();
		}
		else if(input == 3){
			if(attack >= 30){
				if(ci > 0){
					if(rand()%3 == 1){
						system("cls");
						cout << "你在偷东西时不小心踩到了一个东西，发出了声音，你撒腿就跑，村民们气的来干你，你寡不敌众，扣了5点生命(不要问我为什么你防御那么高却还是扣了5滴血)" << endl;
						life -= 5;
						ci--;
						if(life <= 0){
							cout << "你被村民杀死了!" << endl;
							wait(1000);
							cout << "等待复活……" << endl;
							wait(1000);
							life = 100;
							jm();
						}						
						system("pause"); 
						system("cls");
					}
					else{
						system("cls");
						cout << "你的运气很好，村民们没发现你" << endl;
						int _ = rand() % 4 + 1;
						int temp = rand() % 5 + 5;
						cout << "你获得了" << _ << "枚金币和" << temp << "块面包，你把它们吃了，回复了" << temp << "点生命" << endl;
						coin += _; 
						life += temp;
						ci--;
						system("pause");
						system("cls");
					}
					jm();
				}
				else{
					cout << "去刷怪获取次数" << endl; 
					system("pause");
					system("cls");
					jm();
				}
			}
			else{
				cout << "你的攻击力不够，没能力去抢劫" << endl;
				system("pause");
				system("cls");
				jm();
			}
			continue;
		}
		else if(input == 4){
			system("cls");
			while(1){
				cout << "你想制作什么?" << endl << "1,木剑 加5点伤害 消耗 15 木头" << endl << "2,木甲 加3点防御力 消耗 20 木头" << endl << "3,石剑 加8点伤害 消耗 15 石头" << endl << "4,石甲 加5点防御力 消耗 20 石头" << endl;
				cout << "5,铜剑 加10点伤害 消耗 15 铜矿" << endl << "6,铜甲 加8点防御 消耗 20 铜矿" << endl << "7,铁剑 加12点伤害 消耗 15 铁矿" << endl << "8,铁甲 加10点防御 消耗 20 铁矿" << endl << "9,银剑 加 15 点伤害 消耗 15 银矿" << endl << "10,银甲 加 12 点防御 消耗 20 银矿" << endl;
				cout << "11,金剑 加18点伤害 消耗 15 金矿" << endl << "12,金甲 加15点防御 消耗 20 金矿" << endl << "13,猩红剑 加22点伤害 消耗 15 猩红矿" << endl << "14,猩红甲 加18点防御 消耗 20 猩红矿" << endl << "15,钯金剑 加 30 点伤害 消耗 15 钯金矿" << endl << "16,钯金甲 加 25 防御 消耗 20 钯金矿" << endl; 
				cout << "17,叶绿剑 加35伤害 消耗 15 叶绿矿" << endl << "18,叶绿甲 加30防御 消耗 20 叶绿矿" << endl << "19,返回" << endl; 
				int _;
				cin >> _;
				if(_ == 1){
					if(wood >= 15){
						cout << "你用15木头做出了一把木剑" << endl;
						wood -= 15;
						attack += 5;
						system("pause");
						system("cls");
					}
					else{
						cout << "你的木头不够" << endl;
						system("pause");
						system("cls");
						continue;
					}
				}
				else if(_ == 2){
					if(wood >= 20){
						cout << "你用20木头做出了一套木甲" << endl;
						wood -= 20;
						defense += 3;
						system("pause");
						system("cls");
					}
					else{
						cout << "你的木头不够" << endl;
						system("pause");
						system("cls");
						continue;
					}
				}
				else if(_ == 3){
					if(stone >= 15){
						cout << "你用15石头做出了一把石剑" << endl;
						stone -= 15;
						attack += 8;
						system("pause");
						system("cls");
					}
					else{
						cout << "你的石头不够" << endl;
						system("pause");
						system("cls");
						continue;
					}
				}
				else if(_ == 4){
					if(stone >= 20){
						cout << "你用20石头做出了一套石甲" << endl;
						stone -= 20;
						defense += 5;
						system("pause");
						system("cls");
					}
					else{
						cout << "你的石头不够" << endl;
						system("pause");
						system("cls");
						continue;
					}
				}
				else if(_ == 5){
					if(copper >= 15){
						cout << "你用15铜矿做出了一把铜剑" << endl;
						copper -= 15;
						attack += 10;
						system("pause");
						system("cls");
					}
					else{
						cout << "你的铜矿不够" << endl;
						system("pause");
						system("cls");
						continue;
					}
				}
				else if(_ == 6){
					if(copper >= 20){
						cout << "你用20铜矿做出了一套铜甲" << endl;
						copper -= 20;
						defense += 8;
						system("pause");
						system("cls");
					}
					else{
						cout << "你的铜矿不够" << endl;
						system("pause");
						system("cls");
						continue;
					}
				}
				else if(_ == 7){
					if(iron >= 15){
						cout << "你用15铁矿做出了一把铁剑" << endl;
						iron -= 15;
						attack += 12;
						system("pause");
						system("cls");
					}
					else{
						cout << "你的铁矿不够" << endl;
						system("pause");
						system("cls");
						continue;
					}
				}
				else if(_ == 8){
					if(iron >= 20){
						cout << "你用20铁矿做出了一套铁甲" << endl;
						iron -= 20;
						defense += 10;
						system("pause");
						system("cls");
					}
					else{
						cout << "你的铁矿不够" << endl;
						system("pause");
						system("cls");
						continue;
					}
				}
				else if(_ == 9){
					if(sliver >= 15){
						cout << "你用15银矿做出了一把银剑" << endl;
						sliver -= 15;
						attack += 15;
						system("pause");
						system("cls");
					}
					else{
						cout << "你的银矿不够" << endl;
						system("pause");
						system("cls");
						continue;
					}
				}
				else if(_ == 10){
					if(sliver >= 20){
						cout << "你用20银矿做出了一套银甲" << endl;
						sliver -= 20;
						defense += 12;
						system("pause");
						system("cls");
					}
					else{
						cout << "你的银矿不够" << endl;
						system("pause");
						system("cls");
						continue;
					}
				}
				else if(_ == 11){
					if(gold >= 15){
						cout << "你用15金矿做出了一把金剑" << endl;
						gold -= 15;
						attack += 18;
						system("pause");
						system("cls");
					}
					else{
						cout << "你的金矿不够" << endl;
						system("pause");
						system("cls");
						continue;
					}
				}
				else if(_ == 12){
					if(gold >= 20){
						cout << "你用20金矿做出了一套金甲" << endl;
						gold -= 20;
						defense += 15;
						system("pause");
						system("cls");
					}
					else{
						cout << "你的金矿不够" << endl;
						system("pause");
						system("cls");
						continue;
					}
				}
				else if(_ == 13){
					if(crimtane >= 15){
						cout << "你用15猩红矿做出了一把猩红剑" << endl;
						crimtane -= 15;
						attack += 22;
						system("pause");
						system("cls");
					}
					else{
						cout << "你的猩红矿不够" << endl;
						system("pause");
						system("cls");
						continue;
					}
				}
				else if(_ == 14){
					if(crimtane >= 20){
						cout << "你用20猩红矿做出了一套猩红甲" << endl;
						crimtane -= 20;
						defense += 18;
						system("pause");
						system("cls");
					}
					else{
						cout << "你的猩红矿不够" << endl;
						system("pause");
						system("cls");
						continue;
					}
				}
				else if(_ == 15){
					if(palladium >= 15){
						cout << "你用15钯金矿做出了一把钯金剑" << endl;
						palladium -= 15;
						attack += 30;
						system("pause");
						system("cls");
					}
					else{
						cout << "你的钯金矿不够" << endl;
						system("pause");
						system("cls");
						continue;
					}
				}
				else if(_ == 16){
					if(palladium >= 20){
						cout << "你用20钯金矿做出了一套钯金甲" << endl;
						palladium -= 20;
						defense += 25;
						system("pause");
						system("cls");
					}
					else{
						cout << "你的钯金矿不够" << endl;
						system("pause");
						system("cls");
						continue;
					}
				}
				else if(_ == 17){
					if(chlorophyte >= 15){
						cout << "你用15叶绿矿做出了一把叶绿剑" << endl;
						chlorophyte -= 15;
						attack += 35;
						system("pause");
						system("cls");
					}
					else{
						cout << "你的叶绿矿不够" << endl;
						system("pause");
						system("cls");
						continue;
					}
				}
				else if(_ == 18){
					if(chlorophyte >= 20){
						cout << "你用20叶绿矿做出了一套叶绿甲" << endl;
						chlorophyte -= 15;
						defense += 30;
						system("pause");
						system("cls");
					}
					else{
						cout << "你的叶绿矿不够" << endl;
						system("pause");
						system("cls");
						continue;
					}
				}
				else if(_ == 19) break;
				else{
					system("cls");
					cout << "给劳资重输" << endl;
					continue;
				}
			}
			jm();
		}
		else if(input == 5){
			system("cls");
			while(1){
				cout << "-- -- -- 奸商 -- -- --" << endl;
				cout << "你想买啥？" << endl;
				cout << "1,冰雪刃 加 30 点伤害 花费 80 金币" << endl;
				cout << "2,寒冰链甲 加 25 点防御 花费 95 金币" << endl;
				cout << "3,永夜刃 加 50 点伤害 花费 120 金币" << endl;
				cout << "4,熔岩甲 加 35 点防御 花费 130 金币" << endl; 
				cout << "5,治疗药水 回复 20 点生命 花费 200 金币" << endl;
				cout << "6,跟奸商告别" << endl;
				int _;
				cin >> _;
				if(_ == 1){
					if(coin >= 80){
						cout << "购买成功！" << endl;
						attack += 30;
						coin -= 80;
						system("pause");
						system("cls");
						continue;
					}
					else{
						cout << "你的金币不够" << endl;
						system("pause");
						system("cls");
						continue;
					}
				}
				else if(_ == 2){
					if(coin >= 95){
						cout << "购买成功！" << endl;
						defense += 25;
						coin -= 95;
						system("pause");
						system("cls");
						continue;
					}
					else{
						cout << "你的金币不够" << endl;
						system("pause");
						system("cls");
						continue;
					}
				}
				else if(_ == 3){
					if(coin >= 120){
						cout << "购买成功！" << endl;
						attack += 50;
						coin -= 120;
						system("pause");
						system("cls");
						continue;
					}
					else{
						cout << "你的金币不够" << endl;
						system("pause");
						system("cls");
						continue;
					}					
				}
				else if(_ == 4){
					if(coin >= 130){
						cout << "购买成功！" << endl;
						defense += 35;
						coin -= 130;
						system("pause");
						system("cls");
						continue;
					}
					else{
						cout << "你的金币不够" << endl;
						system("pause");
						system("cls");
						continue;
					}					
				}
				else if(_ == 5){
					if(coin >= 200){
						cout << "购买成功！生命增加了20点" << endl;
						coin -= 200;
						life += 20;
						system("pause");
						system("cls");
						continue;
					}
					else{
						cout << "你的金币不够" << endl;
						system("pause");
						system("cls");
						continue;
					}
				}
				else if(_ == 6){
					cout << "奸商：“欢迎下次来送钱啊！”" << endl;
					system("pause");
					system("cls");
					jm();
				}
				else{
					cout << "给我重输" << endl;
					system("pause");
					system("cls");
					continue;				
				}
			}
		}
		else if(input == 6){
			system("cls"); 
			if(mode == 0){
				life2 = 800;
				int temp = 1;
				cout << "开始与克苏鲁之眼作战！" << endl;
				if(resentment != 0){cout << "克苏鲁之眼因为怨念被增强了！" << endl; life2 += resentment/2;}
				cout << "克苏鲁之眼详情：" << endl << "生命：800 " << "攻击：120 (小眼球伤害：50) " << "防御：60" << endl;
				while(life|| life2){
					cout << "请做出你的选择\n1，干！" << endl;
					int _;
					cin >> _;
					if(_ == 1){
						cout << "你向克苏鲁之眼发起了攻击！" << endl;
						wait(200);
						system("color C0");
						wait(200);
						system("color 0F");
						_ = attack - 60;
						if(_ < 1) _ = 1;
						life2 -= _;
						cout << "你对克苏鲁之眼造成了" << _ << "点伤害！" << endl;
						wait(200);
						cout << "克苏鲁之眼还剩" << life2 << "点生命！" << endl;
						if(life2 < 1){
							cout << "克苏鲁之眼被你击败了！你真厉害！" << endl;
							wait(1000);
							cout << "你获得了40枚金币，生命值增加了30点！并获取了5个去村庄抢劫的次数！……但你的怨念增加了120点" << endl;
							wait(1000);
							coin += 40;
							life += 30;
							ci += 5; 
							resentment += 120; 
							system("pause");
							system("cls");
							jm();
						}
						if(life2 <= 400 && temp == 1){
							cout << "克苏鲁之眼进入了第二阶段！" << endl;
							temp = 2;
						}
						_ = rand() % 3;
						wait(200);
						if(temp == 1){
							if(_ != 0){
								cout << "克苏鲁之眼对你使用了冲撞！" << endl;
								wait(200);
								system("color C0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 100 - defense;
								if(_ < 1) _ = 1;
								life -= _;
							}
							else{
								int temp = rand() % 5 + 1; 
								cout << "克苏鲁之眼对你发射了" << temp << "个小眼球！" << endl;
								wait(200);
								system("color C0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = temp * 50 - defense;
								if(_ < 1) _ = 1;
								life -= _;
							}
						}
						else{
							cout << "克苏鲁之眼对你使用了五连冲撞！" << endl;
							wait(200);
							system("color C0");
							wait(200);
							system("color 0F");
							wait(200);
							_ = 120 - defense;
							if(_ < 1) _ = 1;
							life -= _;
						}
						if(life < 1){
							cout << "你被克苏鲁之眼击败了！" << endl;
							wait(1000);
							cout << "等待复活……" << endl;
							wait(1000);
							life = 100;
							jm();
						}
						cout << "你受到了" << _ << "点伤害!" << endl;
						wait(200);
						cout << "你还剩" << life << "点生命！" << endl;
						system("pause");
						system("cls");
					}
					else{
						cout << "别乱选啊！" << endl;
						system("pause");
						system("cls");
						continue;
					}
				}
			}
			else if(mode == 1){
				life2 = 9000;
				int temp = 1;
				cout << "开始与双子魔眼作战！" << endl;
				if(resentment != 0){cout << "双子魔眼因为怨念被增强了！" << endl; life2 += resentment/2;}
				cout << "双子魔眼详情：" << endl << "生命：9000 " << "攻击：300" << "防御：150" << endl;
				while(life|| life2){
					cout << "请做出你的选择\n1，干！" << endl;
					int _;
					cin >> _;
					if(_ == 1){
						cout << "你向双子魔眼发起了攻击！" << endl;
						wait(200);
						system("color C0");
						wait(200);
						system("color 0F");
						_ = attack - 150;
						if(_ < 1) _ = 1;
						life2 -= _;
						cout << "你对双子魔眼造成了" << _ << "点伤害！" << endl;
						wait(200);
						cout << "双子魔眼还剩" << life2 << "点生命！" << endl;
						if(life2 < 1){
							cout << "双子魔眼被你击败了！你真厉害！" << endl;
							wait(1000);
							cout << "你获得了100枚金币，生命值增加了50点！并获取了5个去村庄抢劫的次数！……但你的怨念增加了200点" << endl;
							wait(1000);
							coin += 100;
							life += 50;
							ci += 5; 
							resentment += 200; 
							system("pause");
							system("cls");
							jm();
						}
						if(life2 <= 4500 && temp == 1){
							cout << "双子魔眼进入了第二阶段！" << endl;
							temp = 2;
						}
						_ = rand() % 4;
						wait(200);
						if(temp == 1){
							if(_ == 0){
								cout << "双子魔眼对你使用了冲撞！" << endl;
								wait(200);
								system("color C0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 280 - defense;
								if(_ < 1) _ = 1;
								life -= _;
							}
							else if(_ == 1){
								cout << "双子魔眼对你发射了激光！" << endl;
								wait(200);
								system("color D0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 280 - defense;
								if(_ < 1) _ = 1;
								life -= _;
							}
							else{
								cout << "双子魔眼对你发射了咒火球！" << endl;
								wait(200);
								system("color A0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 280 - defense;
								if(_ < 1) _ = 1;
								life -= _;								
							} 
						}
						else{
							if(_ == 0){
								cout << "双子魔眼对你使用了高速冲撞！" << endl;
								wait(200);
								system("color C0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 320 - defense;
								if(_ < 1) _ = 1;
								life -= _;
							}
							else if(_ == 1){
								cout << "双子魔眼对你使用了连射激光！" << endl;
								wait(200);
								system("color D0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 320 - defense;
								if(_ < 1) _ = 1;
								life -= _;
							}
							else{
								cout << "双子魔眼朝你狂喷咒火！" << endl;
								wait(200);
								system("color A0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 320 - defense;
								if(_ < 1) _ = 1;
								life -= _;								
							} 
						}
						if(life < 1){
							cout << "你被双子魔眼击败了！" << endl;
							wait(1000);
							cout << "等待复活……" << endl;
							wait(1000);
							life = 100;
							jm();
						}
						cout << "你受到了" << _ << "点伤害!" << endl;
						wait(200);
						cout << "你还剩" << life << "点生命！" << endl;
						system("pause");
						system("cls");
					}
					else{
						cout << "别乱选啊！" << endl;
						system("pause");
						system("cls");
						continue;
					}
				}				
			}
			else if(mode == 2){
				life2 = 20000;
				int temp = 1;
				cout << "开始与世纪之花作战！" << endl;
				if(resentment != 0){cout << "世纪之花因为怨念被增强了！" << endl; life2 += resentment/2;}
				cout << "世纪之花详情：" << endl << "生命：20000 " << "攻击：400 " << "防御：450" << endl;
				while(life|| life2){
					cout << "请做出你的选择\n1，干！" << endl;
					int _;
					cin >> _;
					if(_ == 1){
						cout << "你向世纪之花发起了攻击！" << endl;
						wait(200);
						system("color C0");
						wait(200);
						system("color 0F");
						_ = attack - 450;
						if(_ < 1) _ = 1;
						life2 -= _;
						cout << "你对世纪之花造成了" << _ << "点伤害！" << endl;
						wait(200);
						cout << "世纪之花还剩" << life2 << "点生命！" << endl;
						if(life2 < 1){
							cout << "世纪之花被你击败了！你真厉害！" << endl;
							wait(1000);
							cout << "你获得了120枚金币，生命值增加了50点！并获取了8个去村庄抢劫的次数！……但你的怨念增加了300点" << endl;
							wait(1000);
							coin += 120;
							life += 50;
							ci += 8; 
							resentment += 300; 
							system("pause");
							system("cls");
							jm();
						}
						if(life2 <= 10000 && temp == 1){
							cout << "世纪之花进入了第二阶段！" << endl;
							temp = 2;
						}
						_ = rand() % 4;
						wait(200);
						if(temp == 1){
							if(_ == 0){
								cout << "世纪之花对你使用了花瓣片！" << endl;
								wait(200);
								system("color C0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 350 - defense;
								if(_ < 1) _ = 1;
								life -= _;
							}
							else if(_ == 1){
								cout << "世纪之花对你发射了尖叶片！" << endl;
								wait(200);
								system("color A0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 400 - defense;
								if(_ < 1) _ = 1;
								life -= _;
							}
							else{
								cout << "世纪之花对你发射了尖刺球！" << endl;
								wait(200);
								system("color D0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 450 - defense;
								if(_ < 1) _ = 1;
								life -= _;								
							} 
						}
						else{
							if(_ == 0){
								cout << "世纪之花对你使用了高速冲撞！" << endl;
								wait(200);
								system("color C0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 450 - defense;
								if(_ < 1) _ = 1;
								life -= _;
							}
							else if(_ == 1){
								cout << "世纪之花对你使用了钩爪攻击！" << endl;
								wait(200);
								system("color A0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 400 - defense;
								if(_ < 1) _ = 1;
								life -= _;
							}
							else{
								cout << "世纪之花朝你狂喷尖叶片！" << endl;
								wait(200);
								system("color A0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 450 - defense;
								if(_ < 1) _ = 1;
								life -= _;								
							} 
						}
						if(life < 1){
							cout << "你被世纪之花击败了！" << endl;
							wait(1000);
							cout << "等待复活……" << endl;
							wait(1000);
							life = 100;
							jm();
						}
						cout << "你受到了" << _ << "点伤害!" << endl;
						wait(200);
						cout << "你还剩" << life << "点生命！" << endl;
						system("pause");
						system("cls");
					}
					else{
						cout << "别乱选啊！" << endl;
						system("pause");
						system("cls");
						continue;
					}
				}								
			}
			else if(mode == 3){
				life2 = 60000;
				int enat = 0;
				int ende = 0;
				int temp = 1;
				int at, de;
				cout << "开始与白金星舰作战！" << endl;
				if(resentment != 0){cout << "白金星舰因为怨念被增强了！" << endl; life2 += resentment/2;}
				cout << "白金星舰详情：" << endl << "生命：60000 " << "攻击：2200 " << "防御：800(有20%的减伤)" << endl;
				while(life|| life2){
					cout << "请做出你的选择\n1，干！" << endl;
					int _;
					cin >> _;
					if(_ == 1){
						cout << "你向白金星舰发起了攻击！" << endl;
						wait(200);
						system("color C0");
						wait(200);
						system("color 0F");
						_ = 0.8 * (attack - (800 + ende));
						if(_ < 1) _ = 1;
						life2 -= _;
						cout << "你对白金星舰造成了" << _ << "点伤害！" << endl;
						wait(200);
						cout << "白金星舰还剩" << life2 << "点生命！" << endl;
						if(life2 < 1){
							cout << "白金星舰被你击败了！你真厉害！" << endl;
							wait(1000);
							cout << "你获得了200枚金币！属性恢复了！生命值增加了50点！并获取了8个去村庄抢劫的次数！……但你的怨念增加了400点" << endl;
							wait(1000);
							if(temp == 2){
								attack += at;
								defense += de;
							}
							coin += 200;
							life += 50;
							ci += 8; 
							resentment += 400;
							system("pause");
							system("cls");
							jm();
						}
						if(life2 <= 25000 && temp == 1){
							cout << "你感到星辉细胞正在吞噬你的身体……" << endl;
							cout << "你被弱化了！攻击力与防御力各降低了10%！" << endl;
							at = attack * 0.1;
							de = defense * 0.1;
							attack -= at;
							defense -= de;
							temp = 2;
						}
						_ = rand() % 4;
						wait(200);
						if(temp == 1){
							if(_ == 0){
								cout << "白金星舰对你使用了猛击！" << endl;
								wait(200);
								system("color C0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 2500 + enat - defense;
								if(_ < 1) _ = 1;
								life -= _;
							}
							else if(_ == 1){
								cout << "白金星舰对你发射了三道激光！" << endl;
								wait(200);
								system("color 9F");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 2400 + enat - defense;
								if(_ < 1) _ = 1;
								life -= _;
							}
							else{
								cout << "白金星舰使用了充能！" << endl;
								wait(200);
								cout << "白金星舰获得了增强！攻击与防御提升了25点！" << endl;
								enat += 25;
								ende += 25;					
							} 
						}
						else{
							if(_ == 0){
								cout << "白金星舰对你使用了连续猛击！" << endl;
								wait(200);
								system("color C0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 3500 + enat - defense;
								if(_ < 1) _ = 1;
								life -= _;
							}
							else if(_ == 1){
								cout << "白金星舰对你发射了五道激光！" << endl;
								wait(200);
								system("color 9F");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 4000 + enat - defense;
								if(_ < 1) _ = 1;
								life -= _;
							}
							else{
								cout << "白金星舰使用了超级充能！" << endl;
								wait(200);
								cout << "白金星舰获得了增强！攻击与防御提升了50点！" << endl;
								enat += 50;
								ende += 50;					
							} 
						}
						if(life < 1){
							cout << "你被白金星舰击败了！" << endl;
							wait(1000);
							cout << "等待复活……" << endl;
							wait(1000);
							life = 100;
							jm();
						}
						cout << "你受到了" << _ << "点伤害!" << endl;
						wait(200);
						cout << "你还剩" << life << "点生命！" << endl;
						system("pause");
						system("cls");
					}
					else{
						cout << "别乱选啊！" << endl;
						system("pause");
						system("cls");
						continue;
					}
				}															
			}	
		}
else if(input == 7){
			system("cls"); 
			if(mode == 0){ 
				life2 = 1500;
				int cnt = 0;
				int temp = 1;
				cout << "开始与克苏鲁之脑作战！" << endl;
				if(resentment != 0){cout << "克苏鲁之脑因为怨念被增强了！" << endl; life2 += resentment/2;}
				cout << "克苏鲁之脑详情：" << endl << "生命：1500 " << "攻击：80" << "防御：70" << endl;
				while(life|| life2){
					cout << "请做出你的选择\n1，干！" << endl;
					int _;
					cin >> _;
					if(_ == 1){
						cout << "你向克苏鲁之脑发起了攻击！" << endl;
						wait(200);
						system("color C0");
						wait(200);
						system("color 0F");
						_ = attack - 70;
						if(_ < 1) _ = 1;
						life2 -= _;
						cout << "你对克苏鲁之脑造成了" << _ << "点伤害！" << endl;
						wait(200);
						cout << "克苏鲁之脑还剩" << life2 << "点生命！" << endl;
						if(life2 < 1){
							cout << "克苏鲁之脑被你击败了！你真厉害！" << endl;
							cout << "你的攻击与防御都恢复了原状！" << endl;
							attack += cnt * 5;
							defense += cnt * 5;
							wait(1000);
							cout << "你获得了50枚金币与20个猩红矿！，生命值增加了50点！并获取了10个去村庄抢劫的次数！……但你也增加了150点怨念" << endl;
							wait(1000);
							coin += 50;
							life += 50;
							ci += 10;
							resentment += 150;
							crimtane += 20; 
							system("pause");
							system("cls");
							jm();
						}
						if(life2 <= 600 && temp == 1){
							cout << "克苏鲁之脑进入了第二阶段！" << endl;
							temp = 2;
						}
						_ = rand() % 2;
						wait(200);
						if(temp == 1){
							if(_ != 0){
								cout << "克苏鲁之脑对你使用了冲撞！" << endl;
								wait(200);
								system("color C0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 70 - defense;
								if(_ < 1) _ = 1;
								life -= _;
							}
							else{
								cout << "克苏鲁之脑对你使用了大脑致幻！" << endl;
								wait(200);
								system("color D0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 30 - defense;
								if(_ < 1) _ = 1;
								life -= _;
								cout << "你被致幻了！攻击与防御降低了5点！" << endl;
								attack -= 5;
								defense -= 5;
								if(attack < 1) attack = 1;
								if(defense < 0) defense = 0; 
								cnt++;
							}
						}
						else{
							_ = rand()%2;
							if(_ != 0){
								cout << "克苏鲁之脑对你使用了幻影攻击！" << endl;
								wait(200);
								system("color C0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 80 - defense;
								if(_ < 1) _ = 1;
								life -= _;
							}
							else{
								cout << "克苏鲁之脑对你使用了双重大脑致幻！" << endl;
								wait(200);
								system("color D0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 60 - defense;
								if(_ < 1) _ = 1;
								life -= _;
								cout << "你被双重致幻了！攻击与防御降低了10点！" << endl;
								attack -= 10;
								defense -= 10;
								if(attack < 1) attack = 1;
								if(defense < 0) defense = 0; 
								cnt += 2; 
							} 
						}
						if(life < 1){
							cout << "你被克苏鲁之脑击败了！" << endl;
							wait(1000);
							cout << "等待复活……" << endl;
							wait(1000);
							defense += cnt * 5;
							life = 100;
							jm();
						}
						cout << "你受到了" << _ << "点伤害!" << endl;
						wait(200);
						cout << "你还剩" << life << "点生命！" << endl;
						system("pause");
						system("cls");
					}
					else{
						cout << "别乱选啊！" << endl;
						system("pause");
						system("cls");
						continue;
					}
				}
			}
			else if(mode == 1){
				life2 = 10000;
				int temp = 1;
				cout << "开始与毁灭者作战！" << endl;
				if(resentment != 0){cout << "毁灭者因为怨念被增强了！" << endl; life2 += resentment/2;}
				cout << "毁灭者详情：" << endl << "生命：10000 " << "攻击：350" << "防御：140" << endl;
				while(life|| life2){
					cout << "请做出你的选择\n1，干！" << endl;
					int _;
					cin >> _;
					if(_ == 1){
						cout << "你向毁灭者发起了攻击！" << endl;
						wait(200);
						system("color C0");
						wait(200);
						system("color 0F");
						_ = attack - 140;
						if(_ < 1) _ = 1;
						life2 -= _;
						cout << "你对毁灭者造成了" << _ << "点伤害！" << endl;
						wait(200);
						cout << "毁灭者还剩" << life2 << "点生命！" << endl;
						if(life2 < 1){
							cout << "毁灭者被你击败了！你真厉害！" << endl;
							wait(1000);
							cout << "你获得了100枚金币，生命值增加了50点！并获取了5个去村庄抢劫的次数！……但你的怨念增加了200点" << endl;
							wait(1000);
							coin += 100;
							life += 50;
							ci += 5; 
							resentment += 200; 
							system("pause");
							system("cls");
							jm();
						}
						if(life2 <= 5000 && temp == 1){
							cout << "毁灭者进入了第二阶段！" << endl;
							temp = 2;
						}
						_ = rand() % 3;
						wait(200);
						if(temp == 1){
							if(_ == 0){
								cout << "毁灭者对你使用了冲撞！" << endl;
								wait(200);
								system("color C0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 350 - defense;
								if(_ < 1) _ = 1;
								life -= _;
							}
							else if(_ == 1){
								cout << "毁灭者对你发射了激光！" << endl;
								wait(200);
								system("color C0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 300 - defense;
								if(_ < 1) _ = 1;
								life -= _;
							}
							else{
								cout << "毁灭者对你发射了探测器！" << endl;
								wait(200);
								system("color C0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 400 - defense;
								if(_ < 1) _ = 1;
								life -= _;								
							} 
						}
						else{
							if(_ == 0){
								cout << "毁灭者对你疯狂冲撞！" << endl;
								wait(200);
								system("color C0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 400 - defense;
								if(_ < 1) _ = 1;
								life -= _;
							}
							else if(_ == 1){
								cout << "毁灭者对你使用了连射激光！" << endl;
								wait(200);
								system("color D0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 420 - defense;
								if(_ < 1) _ = 1;
								life -= _;
							}
							else{
								cout << "毁灭者对你发射了死亡射线！" << endl;
								wait(200);
								system("color D0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 450 - defense;
								if(_ < 1) _ = 1;
								life -= _;								
							} 
						}
						if(life < 1){
							cout << "你被毁灭者击败了！" << endl;
							wait(1000);
							cout << "等待复活……" << endl;
							wait(1000);
							life = 100;
							jm();
						}
						cout << "你受到了" << _ << "点伤害!" << endl;
						wait(200);
						cout << "你还剩" << life << "点生命！" << endl;
						system("pause");
						system("cls");
					}
					else{
						cout << "别乱选啊！" << endl;
						system("pause");
						system("cls");
						continue;
					}
				}								
			}
			else if(mode == 2){
				life2 = 30000;
				int cnt = 0;
				int temp = 1;
				cout << "开始与瘟疫使者歌莉娅作战！" << endl;
				if(resentment != 0){cout << "瘟疫使者歌莉娅因为怨念被增强了！" << endl; life2 += resentment/2;}
				cout << "瘟疫使者歌莉娅详情：" << endl << "生命：30000 " << "攻击：550 " << "防御：600" << endl;
				while(life|| life2){
					cout << "请做出你的选择\n1，干！" << endl;
					int _;
					cin >> _;
					if(_ == 1){
						cout << "你向瘟疫使者歌莉娅发起了攻击！" << endl;
						wait(200);
						system("color C0");
						wait(200);
						system("color 0F");
						_ = attack - 600;
						if(_ < 1) _ = 1;
						life2 -= _;
						cout << "你对瘟疫使者歌莉娅造成了" << _ << "点伤害！" << endl;
						wait(200);
						cout << "瘟疫使者歌莉娅还剩" << life2 << "点生命！" << endl;
						if(life2 < 1){
							cout << "瘟疫使者歌莉娅被你击败了！你真厉害！" << endl;
							wait(1000);
							cout << "你获得了130枚金币，攻击力恢复了！生命值增加了50点！并获取了8个去村庄抢劫的次数！……但你的怨念增加了350点" << endl;
							wait(1000);
							coin += 130;
							life += 50;
							ci += 8; 
							attack += cnt * 5; 
							resentment += 350; 
							system("pause");
							system("cls");
							jm();
						}
						if(life2 <= 12500 && temp == 1){
							cout << "瘟疫核弹已准备，即将发射！" << endl;
							temp = 2;
						}
						_ = rand() % 4;
						wait(200);
						if(temp == 1){
							if(_ == 0){
								cout << "瘟疫使者歌莉娅对你使用了冲撞！" << endl;
								wait(200);
								system("color C0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 500 - defense;
								if(_ < 1) _ = 1;
								life -= _;
							}
							else if(_ == 1){
								cout << "瘟疫使者歌莉娅对你发射了瘟疫毒刺！" << endl;
								wait(200);
								system("color B0");
								wait(200);
								system("color 0F");
								wait(200);
								cnt++;
								cout << "你被瘟疫病毒感染了！攻击力降低了5点！" << endl;
								attack -= 5; 
								_ = 550 - defense;
								if(_ < 1) _ = 1;
								life -= _;
							}
							else{
								cout << "瘟疫使者歌莉娅对你使用了变异黄蜂！" << endl;
								wait(200);
								system("color B0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 500 - defense;
								if(_ < 1) _ = 1;
								life -= _;								
							} 
						}
						else{
							if(_ == 0){
								cout << "瘟疫使者歌莉娅对你使用了高速冲撞！" << endl;
								wait(200);
								system("color C0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 550 - defense;
								if(_ < 1) _ = 1;
								life -= _;
							}
							else if(_ == 1){
								cout << "瘟疫使者歌莉娅对你发射了瘟疫核弹！" << endl;
								wait(200);
								system("color B0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 1050 - defense;
								cnt += 3;
								attack -= 3 * 5;
								cout << "你被瘟疫病毒感染了！攻击力降低了15点！" << endl;
								if(_ < 1) _ = 1;
								life -= _;
							}
							else{
								cout << "瘟疫使者歌莉娅朝你狂射瘟疫病毒！" << endl;
								wait(200);
								system("color B0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 600 - defense;
								cnt += 1;
								attack -= 1 * 5;
								cout << "你被瘟疫病毒感染了！攻击力降低了5点！" << endl;
								if(_ < 1) _ = 1;
								life -= _;								
							} 
						}
						if(life < 1){
							cout << "你被瘟疫使者歌莉娅击败了！" << endl;
							wait(1000);
							cout << "等待复活……" << endl;
							wait(1000);
							attack += cnt * 5; 
							life = 100;
							jm();
						}
						cout << "你受到了" << _ << "点伤害!" << endl;
						wait(200);
						cout << "你还剩" << life << "点生命！" << endl;
						system("pause");
						system("cls");
					}
					else{
						cout << "别乱选啊！" << endl;
						system("pause");
						system("cls");
						continue;
					}
				}											
			}
			else if(mode == 3){
				life2 = 70000;
				int enat = 0;
				int ende = 0;
				int temp = 1;
				int what = 0;
				int at, de;
				cout << "开始与星神游龙作战！" << endl;
				if(resentment != 0){cout << "星神游龙因为怨念被增强了！" << endl; life2 += resentment/2;}
				cout << "星神游龙详情：" << endl << "生命：70000 " << "攻击：3000 " << "防御：1000(有15%的减伤)" << endl;
				while(life|| life2){
					cout << "请做出你的选择\n1，干！" << endl;
					int _;
					cin >> _;
					if(_ == 1){
						if(what == 0){
							cout << "你向星神游龙发起了攻击！" << endl;
							wait(200);
							system("color C0");
							wait(200);
							system("color 0F");
							_ = 0.85 * (attack - (1000 + ende));
							if(_ < 1) _ = 1;
							life2 -= _;
							cout << "你对星神游龙造成了" << _ << "点伤害！" << endl;
							wait(200);
							cout << "星神游龙还剩" << life2 << "点生命！" << endl;
							if(life2 < 1){
								cout << "星神游龙被你击败了！你真厉害！" << endl;
								wait(1000);
								cout << "你获得了200枚金币！属性恢复了！生命值增加了50点！并获取了8个去村庄抢劫的次数！……但你的怨念增加了400点" << endl;
								wait(1000);
								if(temp == 2){
									attack += at;
									defense += de;
								}
								coin += 200;
								life += 50;
								ci += 8; 
								resentment += 400;
								system("pause");
								system("cls");
								jm();
							}
						}
						else{
							cout << "你被致盲，该回合无法攻击！" << endl;
							what = 0; 
						}
						if(life2 <= 35000 && temp == 1){
							cout << "你感到星辉细胞正在吞噬你的身体……" << endl;
							cout << "你被弱化了！攻击力与防御力各降低了15%！" << endl;
							cout << "星神游龙切换到了飞龙形态！" << endl;
							at = attack * 0.15;
							de = defense * 0.15;
							attack -= at;
							defense -= de;
							temp = 2;
						}
						_ = rand() % 3;
						wait(200);
						if(temp == 1){
							if(_ == 0){
								cout << "星神游龙对你使用了冲撞！" << endl;
								wait(200);
								system("color C0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 3000 + enat - defense;
								if(_ < 1) _ = 1;
								life -= _;
							}
							else if(_ == 1){
								cout << "星神游龙对你发射了星陨射线！" << endl;
								wait(200);
								system("color 9F");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 3500 + enat - defense;
								if(_ < 1) _ = 1;
								life -= _;
							}
						}
						else{
							if(_ == 0){
								cout << "星神游龙对你使用了流影冲撞！" << endl;
								wait(200);
								system("color C0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 4500 + enat - defense;
								if(_ < 1) _ = 1;
								life -= _;
								if(rand()%3 == 0){
									cout << "你被流影致盲了！下一回合将无法行动！" << endl;
									what = 1;
								}
							}
							else if(_ == 1){
								cout << "星神游龙对你发射了星雷！" << endl;
								wait(200);
								system("color 9F");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 4000 + enat - defense;
								if(_ < 1) _ = 1;
								life -= _;
							}
						}
						if(life < 1){
							cout << "你被星神游龙击败了！" << endl;
							wait(1000);
							cout << "等待复活……" << endl;
							wait(1000);
							life = 100;
							jm();
						}
						cout << "你受到了" << _ << "点伤害!" << endl;
						wait(200);
						cout << "你还剩" << life << "点生命！" << endl;
						system("pause");
						system("cls");
					}
					else{
						cout << "别乱选啊！" << endl;
						system("pause");
						system("cls");
						continue;
					}
				}															
			}	
		}
		else if(input == 8){
			system("cls"); 
			if(mode == 0){ 
				life2 = 2000;
				int temp = 1;
				cout << "开始与骷髅队长作战！" << endl;
				if(resentment != 0){cout << "骷髅队长因为怨念被增强了！" << endl; life2 += resentment/2;}
				cout << "骷髅队长详情：" << endl << "生命：2000 " << "攻击：120(骷髅头伤害50) " << "防御：90" << endl;
				while(life|| life2){
					cout << "请做出你的选择\n1，干！" << endl;
					int _;
					cin >> _;
					if(_ == 1){
						cout << "你向骷髅队长发起了攻击！" << endl;
						wait(200);
						system("color C0");
						wait(200);
						system("color 0F");
						_ = attack - 90;
						if(_ < 1) _ = 1;
						life2 -= _;
						cout << "你对骷髅队长造成了" << _ << "点伤害！" << endl;
						wait(200);
						cout << "骷髅队长还剩" << life2 << "点生命！" << endl;
						if(life2 < 1){
							cout << "骷髅队长被你击败了！你真厉害！" << endl;
							wait(1000);
							cout << "你获得了70枚金币！，生命值增加了80点！并获取了15个去村庄抢劫的次数！……但你的怨念也增加了180点" << endl;
							wait(1000);
							coin += 70;
							life += 80;
							ci += 15;
							resentment += 180;
							system("pause");
							system("cls");
							jm();
						}
						if(life2 <= 1000 && temp == 1){
							cout << "骷髅队长进入了第二阶段！" << endl;
							temp = 2;
						}
						_ = rand() % 2;
						wait(200);
						if(temp == 1){
							if(_ != 0){
								cout << "骷髅队长对你扇了一巴掌！" << endl;
								wait(200);
								system("color C0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 100 - defense;
								if(_ < 1) _ = 1;
								life -= _;
							}
							else{
								cout << "骷髅队长对你使用了头槌！" << endl;
								wait(200);
								system("color F0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 120 - defense;
								if(_ < 1) _ = 1;
								life -= _;
							}
						}
						else{
							_ = rand()%2;
							if(_ != 0){
								cout << "骷髅队长对你使用了五连头槌！" << endl;
								wait(200);
								system("color F0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 150 - defense;
								if(_ < 1) _ = 1;
								life -= _;
							}
							else{
								_ = rand() % 5 + 1; 
								cout << "骷髅队长对你发射了" << _ << "个骷髅头！" << endl;
								wait(200);
								system("color C0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 50 * _ - defense;
								if(_ < 1) _ = 1;
								life -= _; 
							} 
						}
						if(life < 1){
							cout << "你被骷髅队长击败了！" << endl;
							wait(1000);
							cout << "等待复活……" << endl;
							wait(1000);
							life = 100;
							jm();
						}
						cout << "你受到了" << _ << "点伤害!" << endl;
						wait(200);
						cout << "你还剩" << life << "点生命！" << endl;
						system("pause");
						system("cls");
					}
					else{
						cout << "别乱选啊！" << endl;
						system("pause");
						system("cls");
						continue;
					}
				}
			}
			else if(mode == 1){
				life2 = 8000;
				int temp = 1;
				cout << "开始与机械骷髅队长作战！" << endl;
				if(resentment != 0){cout << "机械骷髅队长因为怨念被增强了！" << endl; life2 += resentment/2;}
				cout << "机械骷髅队长详情：" << endl << "生命：8000 " << "攻击：350 " << "防御：150" << endl;
				while(life|| life2){
					cout << "请做出你的选择\n1，干！" << endl;
					int _;
					cin >> _;
					if(_ == 1){
						cout << "你向机械骷髅队长发起了攻击！" << endl;
						wait(200);
						system("color C0");
						wait(200);
						system("color 0F");
						_ = attack - 150;
						if(_ < 1) _ = 1;
						life2 -= _;
						cout << "你对机械骷髅队长造成了" << _ << "点伤害！" << endl;
						wait(200);
						cout << "机械骷髅队长还剩" << life2 << "点生命！" << endl;
						if(life2 < 1){
							cout << "机械骷髅队长被你击败了！你真厉害！" << endl;
							wait(1000);
							cout << "你获得了100枚金币！，生命值增加了50点！并获取了5个去村庄抢劫的次数！……但你的怨念也增加了220点" << endl;
							wait(1000);
							coin += 100;
							life += 50;
							ci += 5;
							resentment += 220;
							system("pause");
							system("cls");
							jm();
						}
						if(life2 <= 4000 && temp == 1){
							cout << "机械骷髅队长进入了第二阶段！" << endl;
							temp = 2;
						}
						_ = rand() % 2;
						wait(200);
						if(temp == 1){
							if(_ != 0){
								cout << "机械骷髅队长对你扇了一巴掌！" << endl;
								wait(200);
								system("color C0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 300 - defense;
								if(_ < 1) _ = 1;
								life -= _;
							}
							else{
								cout << "机械骷髅队长对你使用了尖刺头槌！" << endl;
								wait(200);
								system("color F0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 350 - defense;
								if(_ < 1) _ = 1;
								life -= _;
							}
						}
						else{
							_ = rand()%2;
							if(_ != 0){
								cout << "机械骷髅队长对你使用了五连头槌！" << endl;
								wait(200);
								system("color F0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 400 - defense;
								if(_ < 1) _ = 1;
								life -= _;
							}
							else{
								cout << "机械骷髅队长对你使用了炮击！" << endl;
								wait(200);
								system("color C0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 600  - defense;
								if(_ < 1) _ = 1;
								life -= _; 
							} 
						}
						if(life < 1){
							cout << "你被机械骷髅队长击败了！" << endl;
							wait(1000);
							cout << "等待复活……" << endl;
							wait(1000);
							life = 100;
							jm();
						}
						cout << "你受到了" << _ << "点伤害!" << endl;
						wait(200);
						cout << "你还剩" << life << "点生命！" << endl;
						system("pause");
						system("cls");
					}
					else{
						cout << "别乱选啊！" << endl;
						system("pause");
						system("cls");
						continue;
					}
				}				
			}
			else if(mode == 2){
				life2 = 40000;
				int temp = 1;
				cout << "开始与痴愚金龙作战！" << endl;
				if(resentment != 0){cout << "痴愚金龙因为怨念被增强了！" << endl; life2 += resentment/2;}
				cout << "痴愚金龙详情：" << endl << "生命：40000 " << "攻击：500 " << "防御：650" << endl;
				while(life|| life2){
					cout << "请做出你的选择\n1，干！" << endl;
					int _;
					cin >> _;
					if(_ == 1){
						cout << "你向痴愚金龙发起了攻击！" << endl;
						wait(200);
						system("color C0");
						wait(200);
						system("color 0F");
						_ = attack - 650;
						if(_ < 1) _ = 1;
						life2 -= _;
						cout << "你对痴愚金龙造成了" << _ << "点伤害！" << endl;
						wait(200);
						cout << "痴愚金龙还剩" << life2 << "点生命！" << endl;
						if(life2 < 1){
							cout << "痴愚金龙被你击败了！你真厉害！" << endl;
							wait(1000);
							cout << "你获得了150枚金币！生命值增加了50点！并获取了8个去村庄抢劫的次数！……但你的怨念增加了380点" << endl;
							wait(1000);
							coin += 130;
							life += 50;
							ci += 8; 
							resentment += 380; 
							system("pause");
							system("cls");
							jm();
						}
						if(life2 <= 20000 && temp == 1){
							cout << "你感到十分炎热……" << endl;
							temp = 2;
						}
						_ = rand() % 4;
						wait(200);
						if(temp == 1){
							if(_ == 0){
								cout << "痴愚金龙对你使用了冲撞！" << endl;
								wait(200);
								system("color C0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 500 - defense;
								if(_ < 1) _ = 1;
								life -= _;
							}
							else if(_ == 1){
								cout << "痴愚金龙对你发射了黄金羽毛！" << endl;
								wait(200);
								system("color E0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 550 - defense;
								if(_ < 1) _ = 1;
								life -= _;
							}
							else{
								cout << "痴愚金龙对你使用了冲撞！" << endl;
								wait(200);
								system("color C0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 500 - defense;
								if(_ < 1) _ = 1;
								life -= _;								
							} 
						}
						else{
							if(_ == 0){
								cout << "痴愚金龙对你使用了四连冲撞！" << endl;
								wait(200);
								system("color C0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 600 - defense;
								if(_ < 1) _ = 1;
								life -= _;
							}
							else if(_ == 1){
								cout << "痴愚金龙对你发射了一大片黄金羽毛！" << endl;
								wait(200);
								system("color E0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 650 - defense;
								if(_ < 1) _ = 1;
								life -= _;
							}
							else{
								cout << "痴愚金龙朝你使用了龙裔！" << endl;
								wait(200);
								system("color C0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 600 - defense;
								if(_ < 1) _ = 1;
								life -= _;								
							} 
						}
						if(life < 1){
							cout << "你被痴愚金龙击败了！" << endl;
							wait(1000);
							cout << "等待复活……" << endl;
							wait(1000);
							life = 100;
							jm();
						}
						cout << "你受到了" << _ << "点伤害!" << endl;
						wait(200);
						cout << "你还剩" << life << "点生命！" << endl;
						system("pause");
						system("cls");
					}
					else{
						cout << "别乱选啊！" << endl;
						system("pause");
						system("cls");
						continue;
					}
				}															
			}
			else if(mode == 3){
				cout << "作者正在火速更新！" << endl;
				system("pause");
				system("cls");
				jm();
			}
		}
		else if(input == 9){
			system("cls"); 
			if(mode == 0){ 
				life2 = 5000;
				int temp = 1;
				cout << "开始与血肉之墙作战！" << endl;
				if(resentment != 0){cout << "血肉之墙因为怨念被增强了！" << endl; life2 += resentment/2;}
				cout << "血肉之墙详情：" << endl << "生命：5000 " << "攻击：180(激光伤害30，饿鬼伤害40) " << "防御：100" << endl;
				while(life|| life2){
					cout << "请做出你的选择\n1，干！" << endl;
					int _;
					cin >> _;
					if(_ == 1){
						cout << "你向血肉之墙发起了攻击！" << endl;
						wait(200);
						system("color C0");
						wait(200);
						system("color 0F");
						_ = attack - 100;
						if(_ < 1) _ = 1;
						life2 -= _;
						cout << "你对血肉之墙造成了" << _ << "点伤害！" << endl;
						wait(200);
						cout << "血肉之墙还剩" << life2 << "点生命！" << endl;
						if(life2 < 1){
							cout << "血肉之墙被你击败了！你真厉害！" << endl;
							wait(1000);
							cout << "你获得了100枚金币！，生命值增加了100点！并获取了20个去村庄抢劫的次数！……但你的怨念也增加了800点" << endl;
							cout << "你的世界进入了困难模式！怪物都已经变得极为强悍，小心！" << endl;
							mode = 1;
							wait(1000);
							coin += 100;
							life += 100;
							ci += 20;
							resentment += 800;
							system("pause");
							system("cls");
							jm();
						}
						if(life2 <= 2500 && temp == 1){
							cout << "血肉之墙进入了第二阶段！" << endl;
							temp = 2;
						}
						_ = rand() % 2;
						wait(200);
						if(temp == 1){
							if(_ != 0){
								cout << "血肉之墙对你发射了激光！" << endl;
								wait(200);
								system("color D0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 130 - defense;
								if(_ < 1) _ = 1;
								life -= _;
							}
							else{
								cout << "血肉之墙对你发射了饿鬼！" << endl;
								wait(200);
								system("color F0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 150 - defense;
								if(_ < 1) _ = 1;
								life -= _;
							}
						}
						else{
							_ = rand()%2;
							if(_ != 0){
								cout << "血肉之墙对你使用了激光连射！" << endl;
								wait(200);
								system("color D0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 180 - defense;
								if(_ < 1) _ = 1;
								life -= _;
							}
							else{
								cout << "血肉之墙对你使用了撕咬！" << endl;
								wait(200);
								system("color C0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 200 - defense;
								if(_ < 1) _ = 1;
								life -= _; 
							} 
						}
						if(life < 1){
							cout << "你被血肉之墙击败了！" << endl;
							wait(1000);
							cout << "等待复活……" << endl;
							wait(1000);
							life = 100;
							jm();
						}
						cout << "你受到了" << _ << "点伤害!" << endl;
						wait(200);
						cout << "你还剩" << life << "点生命！" << endl;
						system("pause");
						system("cls");
					}
					else{
						cout << "别乱选啊！" << endl;
						system("pause");
						system("cls");
						continue;
					}
				}
			}
			else if(mode == 1){
				life2 = 10000;
				int temp = 1;
				cout << "开始与奥库瑞姆作战！" << endl;
				if(resentment != 0){cout << "奥库瑞姆因为怨念被增强了！" << endl; life2 += resentment/2;}
				cout << "奥库瑞姆详情：" << endl << "生命：10000 " << "攻击：400 " << "防御：300" << endl;
				while(life|| life2){
					cout << "请做出你的选择\n1，干！" << endl;
					int _;
					cin >> _;
					if(_ == 1){
						cout << "你向奥库瑞姆发起了攻击！" << endl;
						wait(200);
						system("color C0");
						wait(200);
						system("color 0F");
						_ = attack - 300;
						if(_ < 1) _ = 1;
						life2 -= _;
						cout << "你对奥库瑞姆造成了" << _ << "点伤害！" << endl;
						wait(200);
						cout << "奥库瑞姆还剩" << life2 << "点生命！" << endl;
						if(life2 < 1){
							cout << "奥库瑞姆被你击败了！你真厉害！" << endl;
							wait(1000);
							cout << "你获得了100枚金币！，生命值增加了100点！并获取了20个去村庄抢劫的次数！……但你的怨念也增加了1500点" << endl;
							mode = 2;
							wait(1000);
							coin += 100;
							life += 100;
							ci += 20;
							resentment += 1500;
							system("pause");
							system("cls");
							jm();
						}
						if(life2 <= 5000 && temp == 1){
							cout << "奥库瑞姆进入了第二阶段！" << endl;
							temp = 2;
						}
						_ = rand() % 2;
						wait(200);
						if(temp == 1){
							if(_ != 0){
								cout << "奥库瑞姆对你发射了仆从！" << endl;
								wait(200);
								system("color C0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 300 - defense;
								if(_ < 1) _ = 1;
								life -= _;
							}
							else{
								cout << "奥库瑞姆对你使用了冲撞！" << endl;
								wait(200);
								system("color F0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 400 - defense;
								if(_ < 1) _ = 1;
								life -= _;
							}
						}
						else{
							_ = rand()%2;
							if(_ != 0){
								cout << "奥库瑞姆对你狂射激光！" << endl;
								wait(200);
								system("color D0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 450 - defense;
								if(_ < 1) _ = 1;
								life -= _;
							}
							else{
								cout << "奥库瑞姆对你使用了恶魔锄刀！" << endl;
								wait(200);
								system("color D0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 500 - defense;
								if(_ < 1) _ = 1;
								life -= _; 
							} 
						}
						if(life < 1){
							cout << "你被奥库瑞姆击败了！" << endl;
							wait(1000);
							cout << "等待复活……" << endl;
							wait(1000);
							life = 100;
							jm();
						}
						cout << "你受到了" << _ << "点伤害!" << endl;
						wait(200);
						cout << "你还剩" << life << "点生命！" << endl;
						system("pause");
						system("cls");
					}
					else{
						cout << "别乱选啊！" << endl;
						system("pause");
						system("cls");
						continue;
					}
				}	
			}	
			else if(mode == 2){
				life2 = 40000;
				int temp = 1;
				cout << "开始与丛林龙作战！" << endl;
				if(resentment != 0){cout << "丛林龙因为怨念被增强了！" << endl; life2 += resentment/2;}
				cout << "丛林龙详情：" << endl << "生命：40000 " << "攻击：2000 " << "防御：1000(有10%的减伤)" << endl;
				while(life|| life2){
					cout << "请做出你的选择\n1，干！" << endl;
					int _;
					cin >> _;
					if(_ == 1){
						cout << "你向丛林龙发起了攻击！" << endl;
						wait(200);
						system("color C0");
						wait(200);
						system("color 0F");
						_ = 0.9 * (attack - 1000);
						if(_ < 1) _ = 1;
						life2 -= _;
						cout << "你对丛林龙造成了" << _ << "点伤害！" << endl;
						wait(200);
						cout << "丛林龙还剩" << life2 << "点生命！" << endl;
						if(life2 < 1){
							cout << "丛林龙被你击败了！你真厉害！" << endl;
							wait(1000);
							cout << "你获得了200枚金币！生命值增加了50点！并获取了8个去村庄抢劫的次数！……但你的怨念增加了3000点" << endl;
							wait(1000);
							coin += 200;
							life += 50;
							ci += 8; 
							resentment += 3000;
							mode = 3; 
							system("pause");
							system("cls");
							jm();
						}
						if(life2 <= 20000 && temp == 1){
							cout << "周围的空气变得灼热起来……" << endl;
							cout << "丛林龙获得了增强！攻击力大幅度提升了！" << endl;
							temp = 2;
						}
						_ = rand() % 4;
						wait(200);
						if(temp == 1){
							if(_ == 0){
								cout << "丛林龙对你使用了高速冲撞！" << endl;
								wait(200);
								system("color C0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 2000 - defense;
								if(_ < 1) _ = 1;
								life -= _;
							}
							else if(_ == 1){
								cout << "丛林龙对你发射了一大片黄金羽毛！" << endl;
								wait(200);
								system("color E0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 2500 - defense;
								if(_ < 1) _ = 1;
								life -= _;
							}
							else{
								cout << "丛林龙对你使用了龙吟！" << endl;
								wait(200);
								system("color C0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 2500 - defense;
								if(_ < 1) _ = 1;
								life -= _;								
							} 
						}
						else{
							if(_ == 0){
								cout << "丛林龙对你使用了圣龙冲撞！" << endl;
								wait(200);
								system("color C0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 3500 - defense;
								if(_ < 1) _ = 1;
								life -= _;
							}
							else if(_ == 1){
								cout << "丛林龙对你发射了一道黄金羽毛龙卷！" << endl;
								wait(200);
								system("color E0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 4500 - defense;
								if(_ < 1) _ = 1;
								life -= _;
							}
							else{
								cout << "丛林龙朝你使用了金龙圣火！" << endl;
								wait(200);
								system("color E0");
								wait(200);
								system("color 0F");
								wait(200);
								_ = 4000 - defense;
								if(_ < 1) _ = 1;
								life -= _;								
							} 
						}
						if(life < 1){
							cout << "你被丛林龙击败了！" << endl;
							wait(1000);
							cout << "等待复活……" << endl;
							wait(1000);
							life = 100;
							jm();
						}
						cout << "你受到了" << _ << "点伤害!" << endl;
						wait(200);
						cout << "你还剩" << life << "点生命！" << endl;
						system("pause");
						system("cls");
					}
					else{
						cout << "别乱选啊！" << endl;
						system("pause");
						system("cls");
						continue;
					}
				}															
			}
			else if(mode == 3){
				cout << "作者正在火速更新！" << endl;
				system("pause");
				system("cls");
				jm();
			}	
		}
else if(input == 10){//刷怪 
			system("cls"); 
			if(mode == 0){ 
				int _ = rand()%2;
				if(_ == 0){
					life2 = 60; 
					cout << "开始与僵尸作战！" << endl;
					if(resentment != 0){cout << "僵尸因为怨念被增强了！" << endl; life2 += resentment/2;}
					cout << "僵尸详情：" << endl << "生命：60 " << "攻击：15 " << "防御：0" << endl;
					while(life || life2){
						cout << "请做出你的选择：\n1,干！" << endl;
						cin >> _;
						if(_ == 1){
							cout << "你向僵尸发起了攻击!" << endl;
							wait(200);
							system("color C0");
							life2 -= attack;
							wait(200);
							system("color 0F");
							cout << "你对僵尸造成了" << attack << "点伤害！" << endl;
							if(life2 <= 0){//赢咯！ 
								cout << "僵尸被你击败了！你获得了10个金币！……但增加了5点怨念" << endl;
								coin += 10;
								ci++;
								resentment += 5;
								wait(1000);
								system("pause");
								system("cls");
								jm();
							} 
							cout << "僵尸还剩" << life2 << "点生命！" << endl;
							wait(200);
							cout << "僵尸发起了反击!" << endl;
							wait(200);
							system("color C0");
							_ = 15 - defense;
							if(_ < 1) _ = 1;
							life -= _;
							wait(200);
							system("color 0F");
							cout << "僵尸打掉了你" << _ << "点生命！" << endl;
							if(life <= 0){
								cout << "你被杀死了!" << endl;
								wait(1000);
								cout << "等待复活……" << endl;
								wait(1000);
								life = 100;
								jm();
							}
							cout << "你还有" << life << "点生命" << endl;
							system("pause");
							system("cls");
							continue;
						}
						else{
							cout << "别乱选啊" << endl;
							continue;
						}
					}				
				}
				else if(_ == 1){
					life2 = 50; 
					cout << "开始与恶魔之眼作战！" << endl;
					if(resentment != 0){cout << "恶魔之眼因为怨念被增强了！" << endl; life2 += resentment/2;}
					cout << "恶魔之眼详情：" << endl << "生命：50 " << "攻击：20 " << "防御：0" << endl;
					while(life || life2){
						cout << "请做出你的选择：\n1,干！" << endl;
						cin >> _;
						if(_ == 1){
							cout << "你向恶魔之眼发起了攻击!" << endl;
							wait(200);
							system("color C0");
							life2 -= attack;
							wait(200);
							system("color 0F");
							cout << "你对恶魔之眼造成了" << attack << "点伤害！" << endl;
							if(life2 <= 0){
								cout << "恶魔之眼被你击败了！你获得了10个金币！……但增加了5点怨念" << endl;
								coin += 10;
								ci++;
								resentment += 5;
								wait(1000);
								system("pause");
								system("cls");
								jm();
							} 
							cout << "恶魔之眼还剩" << life2 << "点生命！" << endl;
							wait(200);
							cout << "恶魔之眼发起了反击!" << endl;
							wait(200);
							system("color C0");
							_ = 20 - defense;
							if(_ < 1) _ = 1;
							life -= _;
							wait(200);
							system("color 0F");
							cout << "恶魔之眼打掉了你" << _ << "点生命！" << endl;
							if(life <= 0){
								cout << "你被杀死了!" << endl;
								wait(1000);
								cout << "等待复活……" << endl;
								wait(1000);
								life = 100;
								jm();
							}
							cout << "你还有" << life << "点生命" << endl;
							system("pause");
							system("cls");
							continue;
						}
						else{
							cout << "别乱选啊" << endl;
							continue;
						}
					}								
				} 
			}
			else if(mode == 1){
				int _ = rand()%2;
				if(_ == 0){
					life2 = 300; 
					cout << "开始与血腥僵尸作战！" << endl;
					if(resentment != 0){cout << "血腥僵尸因为怨念被增强了！" << endl; life2 += resentment/2;}
					cout << "血腥僵尸详情：" << endl << "生命：300 " << "攻击：100 " << "防御：20" << endl;
					while(life || life2){
						cout << "请做出你的选择：\n1,干！" << endl;
						cin >> _;
						if(_ == 1){
							cout << "你向血腥僵尸发起了攻击!" << endl;
							wait(200);
							system("color C0");
							_ = attack - 20;
							if(_ < 1) _ = 1; 
							life2 -= _;
							wait(200);
							system("color 0F");
							cout << "你对血腥僵尸造成了" << _ << "点伤害！" << endl;
							if(life2 <= 0){
								cout << "血腥僵尸被你击败了！你获得了50个金币！……但增加了15点怨念" << endl;
								coin += 50;
								ci++;
								resentment += 15;
								wait(1000);
								system("pause");
								system("cls");
								jm();
							} 
							cout << "血腥僵尸还剩" << life2 << "点生命！" << endl;
							wait(200);
							cout << "血腥僵尸发起了反击!" << endl;
							wait(200);
							system("color C0");
							_ = 100 - defense;
							if(_ < 1) _ = 1;
							life -= _;
							wait(200);
							system("color 0F");
							cout << "血腥僵尸打掉了你" << _ << "点生命！" << endl;
							if(life <= 0){
								cout << "你被杀死了!" << endl;
								wait(1000);
								cout << "等待复活……" << endl;
								wait(1000);
								life = 100;
								jm();
							}
							cout << "你还有" << life << "点生命" << endl;
							system("pause");
							system("cls");
							continue;
						}
						else{
							cout << "别乱选啊" << endl;
							continue;
						}
					}				
				}
				else if(_ == 1){
					life2 = 250; 
					cout << "开始与幻灵作战！" << endl;
					if(resentment != 0){cout << "幻灵因为怨念被增强了！" << endl; life2 += resentment/2;}
					cout << "幻灵详情：" << endl << "生命：250 " << "攻击：150 " << "防御：0" << endl;
					while(life || life2){
						cout << "请做出你的选择：\n1,干！" << endl;
						cin >> _;
						if(_ == 1){
							cout << "你向幻灵发起了攻击!" << endl;
							wait(200);
							system("color C0");
							life2 -= attack;
							wait(200);
							system("color 0F");
							cout << "你对幻灵造成了" << attack << "点伤害！" << endl;
							if(life2 <= 0){
								cout << "幻灵被你击败了！你获得了50个金币！……但增加了5点怨念" << endl;
								coin += 50;
								ci++;
								resentment += 5;
								wait(1000);
								system("pause");
								system("cls");
								jm();
							} 
							cout << "幻灵还剩" << life2 << "点生命！" << endl;
							wait(200);
							cout << "幻灵发起了反击!" << endl;
							wait(200);
							system("color C0");
							_ = 150 - defense;
							if(_ < 1) _ = 1;
							life -= _;
							wait(200);
							system("color 0F");
							cout << "幻灵打掉了你" << _ << "点生命！" << endl;
							if(life <= 0){
								cout << "你被杀死了!" << endl;
								wait(1000);
								cout << "等待复活……" << endl;
								wait(1000);
								life = 100;
								jm();
							}
							cout << "你还有" << life << "点生命" << endl;
							system("pause");
							system("cls");
							continue;
						}
						else{
							cout << "别乱选啊" << endl;
							continue;
						}
					}								
				} 				
			}
		}
		else if(input == 11){
			cout << "以下是你的状态" << endl;
			cout << "你的攻击力为" << attack << "点，你的防御力为" << defense << "点" << endl;  
			cout << "你的木头有" << wood << "个" << endl;
			cout << "你的石头有" << stone << "个" << endl;
			cout << "你的铜矿有" << copper << "个" << endl;
			cout << "你的铁矿有" << iron << "个" << endl;
			cout << "你的银矿有" << sliver << "个" << endl;
			cout << "你的金矿有" << gold << "个" << endl;
			cout << "你的猩红矿有" << crimtane << "个" << endl;
			cout << "你的钯金矿有" << palladium << "个" << endl; 
			cout << "你的叶绿矿有" << chlorophyte << "个" << endl;
			cout << "你有" << coin << "枚金币" << endl; 
			cout << "你的生命值为" << life << endl; 
			system("pause");
			system("cls");
			jm();
		}
		else if(input == 12){
			cout << "已退出" << endl;
			abort();
		}
		else{
			cout << "没有这个选项，给我重输" << endl;
			system("pause");
			system("cls");
		}
	}
}
int main()
{
	ios::sync_with_stdio(false);
    cin.tie(nullptr);
 	cout.tie(nullptr);
// 	freopen(".in", "r", stdin);
// 	freopen(".out", "w", stdout);
	MessageBoxA(nullptr, "该游戏为SB737之神原创，改编记得先说一声", "注意！",MB_ICONWARNING);
	cout << "按任意键开始游戏" << endl;
	system("pause");
	system("cls"); 
	start();
	jm();
	return 0;
}
