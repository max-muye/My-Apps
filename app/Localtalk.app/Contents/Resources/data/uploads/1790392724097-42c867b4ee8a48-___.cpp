#include<bits/stdc++.h>
#include<thread>
#include<chrono>
using namespace std;
int hfb = 10000;
int maxbloodold=30;
int maxblood = 30;
int blood = 30;
int tou = 0, jia = 0, gua = 0, bao = 1, qiang = 1, nanmax=3;
int toux[] = {0,1,2,3,4,5,6}; //头伤害减免
int jiax[] = {0,10,15,25,35,50,70}; //甲血量加成
int guax[] = {0,5,10,15,20,25,30}; //挂背包格数
int guaxnew=0;//临时挂格数
int baox[] = {0,10,20,30,40,50,60}; //背包格数
int baoxnew=0;//临时背包格数
int qiangx[] = {0,3,7,15,20,25,30}; //枪伤害
int xiang[10][7]={0,50,70,90,100,100,100,0,30,60,80,95,100,100,0,10,30,70,90,99,100,0,0,0,10,60,90,100};
int guazhuang[5]={0};
void chushihua(){
	maxblood=maxbloodold+jiax[jia];
	blood=maxblood;
	guaxnew=guax[gua];
	baoxnew=baox[bao];
	nanmax=max((hfb-1)/400000+1,3);
	guaxnew=guax[gua]-guazhuang[1]-guazhuang[2]*2-guazhuang[3]*3-guazhuang[4]*4;
}
void chufa(int nandu) {
	int hfb1 = 0;
	while (1) {
		int sui,n;
		cout<<"血量："<<blood<<"/"<<maxblood<<"\n";
		cout<<"背包格数："<<baoxnew<<"/"<<baox[bao]<<"干什么？\n";
		cout<<"1.搜刮\n";
		cout<<"2.撤离\n";
		cin>>n;
		if(n==1){
			sui=rand()%4;
			if(sui<nandu){
				sui=rand()%2;
				if(sui==0) cout<<"你在搜刮途中不小心碰到了人机！";
				if(sui==1) cout<<"你在搜刮途中不小心碰到了其他玩家！";
				int dblood;
				int dd;
				int dshang,dqiang;
				if(nandu==1){
					dblood=rand()%11+10+5*sui;
					dd=rand()%2;
					dshang=(rand()%4+1)+sui;
					dqiang=rand()%2+1;
				}
				if(nandu==2){
					dblood=rand()%11+30+10*sui;
					dd=rand()%3+1;
					dshang=rand()%5+5+3*sui;
					dqiang=rand()%3+2;
				}
				if(nandu==3){
					dblood=rand()%21+50+10*sui;
					dd=rand()%4+2+sui;
					dshang=rand()%16+7+3*sui;
					dqiang=rand()%4+3;
				}
				cout<<"敌人血量："<<dblood<<"\n";
				cout<<"敌人套装等级："<<dd<<"\n";
				cout<<"敌人伤害："<<dshang<<"\n";
				cout<<"你的血量："<<blood<<"\n";
				cout<<"你的头等级："<<tou<<"\n";
				cout<<"你的甲等级："<<jia<<"\n";
				cout<<"你的伤害："<<qiangx[qiang]<<"\n";
				while(dblood>0&&blood>0){
					std::this_thread::sleep_for(std::chrono::seconds(1));
					int shishang,dshishang;
					if(qiang-dd>=1) shishang=qiangx[qiang];
					else if(qiang-dd==0) shishang=(qiangx[qiang]-1)/2+1;
					else shishang=(qiangx[qiang]-1)/5+1;
					sui=rand()%10;
					if(sui==9){
						cout<<"打空了！";
						shishang=0;
					}
					else if(sui>1) cout<<"你对敌人造成了"<<shishang<<"点伤害！";
					else{
						shishang*=2;
						cout<<"爆头！你对敌人造成了"<<shishang<<"点伤害！";
					}
					dblood-=shishang;
					cout<<"敌人血量："<<dblood<<"\n";
					std::this_thread::sleep_for(std::chrono::seconds(1));
					int x=1;
					sui=rand()%10;
					if(sui<=1){
						cout<<"爆头！";
						x=2;
					}
					else if(sui==9){
						cout<<"敌人打空了！";
						x=0;
					}
					if(x!=0){
						if(x==2){
							if(dqiang-tou>=1) dshishang=dshang*2;
							else if(dqiang-tou==0) dshishang=dshang;
							else dshishang=(dshang-1)/5+1;
							dshishang-=toux[tou];
						}
						if(x==1){
							if(dqiang-jia>=1) dshishang=dshang;
							else if(dqiang-jia==0) dshishang=dshang/2;
							else dshishang=int(dshang-1)/5+1;
						}
						cout<<"敌人对你造成了"<<dshishang<<"点伤害！";
					}
					blood-=dshishang;
					cout<<"你的血量："<<blood<<"/"<<maxblood<<"\n";
				}
				if(dblood<=0&&blood>0) cout<<"你击败了敌人！";
				else{
					cout<<"你死了!\n";
					tou=0;
					jia=0;
					gua=0;
					bao=1;
					qiang=1;
					memset(guazhuang,0,sizeof(guazhuang));
					return;
				}
				cout<<"\n";
			}
			else{
				sui=rand()%100;
				int sui3,sui4,sui5;
				if(nandu==1){
					sui3=rand()%2;
				}
				if(nandu==2){
					sui3=rand()%2+1;
				}
				if(nandu==3){
					sui3=rand()%3+1;
				}
				if(sui<xiang[sui3][1]){
					sui4=(rand()%5+1)*1000;
					sui5=rand()%3+1;
					cout<<"白，价值"<<sui4<<",占格数"<<sui5<<",是否放入背包？(1是，其他不是)\n";
				}
				else if(sui<xiang[sui3][2]){
					sui4=(rand()%10+6)*1000;
					sui5=rand()%3+1;
					cout<<"绿，价值"<<sui4<<",占格数"<<sui5<<",是否放入背包？(1是，其他不是)\n";
				}
				else if(sui<xiang[sui3][3]){
					sui4=(rand()%15+16)*1000;
					sui5=rand()%3+1;
					cout<<"蓝，价值"<<sui4<<",占格数"<<sui5<<",是否放入背包？(1是，其他不是)\n";
				}
				else if(sui<xiang[sui3][4]){
					sui4=(rand()%20+31)*1000;
					sui5=rand()%3+1;
					cout<<"紫，价值"<<sui4<<",占格数"<<sui5<<",是否放入背包？(1是，其他不是)\n";
				}
				else if(sui<xiang[sui3][5]){
					sui4=(rand()%30+51)*1000;
					sui5=rand()%3+1;
					cout<<"金，价值"<<sui4<<",占格数"<<sui5<<",是否放入背包？(1是，其他不是)\n";
				}
				else if(sui<xiang[sui3][6]){
					sui4=(rand()%50+101)*1000;
					sui5=rand()%3+1;
					cout<<"红，价值"<<sui4<<",占格数"<<sui5<<",是否放入背包？(1是，其他不是)\n";
				}
				cin>>n;
				if(n==1){
					if(baoxnew<sui5) cout<<"背包格数不足！";
					else{
						baoxnew-=sui5;
						hfb1+=sui4;
					}
				}
			}
			if(blood<maxblood){
				if(blood+3>=maxblood&&guazhuang[1]>0){
					blood=maxblood;
					cout<<"你使用强效注射器回复了3血量！";
					guazhuang[1]--;
				}
				else if(blood+6>=maxblood&&guazhuang[2]>0){
					blood=maxblood;
					cout<<"你使用车载急救包回复了6血量！";
					guazhuang[2]--;
				}
				else if(blood+12>=maxblood&&guazhuang[3]>0){
					blood=maxblood;
					cout<<"你使用野战急救包回复了12血量！";
					guazhuang[3]--;
				}
				else if(blood+20>=maxblood&&guazhuang[4]>0){
					blood=maxblood;
					cout<<"你使用战地医疗箱回复了20血量！";
					guazhuang[4]--;
				}
				else{
					if(guazhuang[4]>0){
						blood+=20;
						cout<<"你使用战地医疗箱回复了20血量！";
						guazhuang[4]--;
					}
					else if(guazhuang[3]>0){
						blood+=12;
						cout<<"你使用野战急救包回复了12血量！";
						guazhuang[3]--;
					}
					else if(guazhuang[2]>0){
						blood+=6;
						cout<<"你使用车载急救包回复了6血量！";
						guazhuang[2]--;
					}
					else if(guazhuang[1]>0){
						blood+=3;
						cout<<"你使用强效注射器回复了3血量！";
						guazhuang[1]--;
					}
				}
				guaxnew=guax[gua]-guazhuang[1]-guazhuang[2]*2-guazhuang[3]*3-guazhuang[4]*4;
			}
		}
		else if(n==2){
			cout<<"成功撤离！哈夫币+"<<hfb1<<"\n";
			hfb+=hfb1;
			break;
		}
	}
}
int jiage[7]={0,5000,50000,100000,1000000,4000000,10000000};
int ctou[7]={0},cjia[7]={0},cgua[7]={0},cbao[7]={0},cqiang[7]={0};
int huixue[5]={0};
void cangku(){
	cout<<"头："<<tou<<"级，减伤"<<toux[tou]<<"\n";
	cout<<"甲："<<jia<<"级，加血"<<jiax[jia]<<"\n";
	cout<<"挂："<<gua<<"级，容量"<<guaxnew<<"/"<<guax[gua]<<"\n";
	cout<<"包："<<bao<<"级，容量"<<baox[bao]<<"\n";
	cout<<"武器："<<qiang<<"级，伤害"<<qiangx[qiang]<<"\n";
	cout<<"仓库内：\n";
	cout<<"1级头："<<ctou[1]<<"\n";
	cout<<"2级头："<<ctou[2]<<"\n";
	cout<<"3级头："<<ctou[3]<<"\n";
	cout<<"4级头："<<ctou[4]<<"\n";
	cout<<"5级头："<<ctou[5]<<"\n";
	cout<<"6级头："<<ctou[6]<<"\n";
	cout<<"1级甲："<<cjia[1]<<"\n";
	cout<<"2级甲："<<cjia[2]<<"\n";
	cout<<"3级甲："<<cjia[3]<<"\n";
	cout<<"4级甲："<<cjia[4]<<"\n";
	cout<<"5级甲："<<cjia[5]<<"\n";
	cout<<"6级甲："<<cjia[6]<<"\n";
	cout<<"1级挂："<<cgua[1]<<"\n";
	cout<<"2级挂："<<cgua[2]<<"\n";
	cout<<"3级挂："<<cgua[3]<<"\n";
	cout<<"4级挂："<<cgua[4]<<"\n";
	cout<<"5级挂："<<cgua[5]<<"\n";
	cout<<"6级挂："<<cgua[6]<<"\n";
	cout<<"2级包："<<cbao[2]<<"\n";
	cout<<"3级包："<<cbao[3]<<"\n";
	cout<<"4级包："<<cbao[4]<<"\n";
	cout<<"5级包："<<cbao[5]<<"\n";
	cout<<"6级包："<<cbao[6]<<"\n";
	cout<<"2级武器："<<cqiang[2]<<"\n";
	cout<<"3级武器："<<cqiang[3]<<"\n";
	cout<<"4级武器："<<cqiang[4]<<"\n";
	cout<<"5级武器："<<cqiang[5]<<"\n";
	cout<<"6级武器："<<cqiang[6]<<"\n";
	cout<<"强效注射剂（回血3）："<<huixue[1]<<"\n";
	cout<<"车载急救包（回血6）："<<huixue[2]<<"\n";
	cout<<"野战急救包（回血12）："<<huixue[3]<<"\n";
	cout<<"战地医疗箱（回血20）："<<huixue[4]<<"\n";
	cout<<"是否交换装备？（0退出，1头，2甲，3挂，4包，5武器，6道具）";
	while(1){
		chushihua();
		int n;
		cin>>n;
		if(n==0) break;
		if(n==1){
			cout<<"换成几级？(0~6)\n";
			int m;
			cin>>m;
			if(m<0||m>6) cout<<"等级不存在！\n"; 
			else if(ctou[m]>0){
				cout<<"交换成功！\n";
				ctou[tou]+=1;
				tou=m;
				ctou[m]-=1;
			}
			else cout<<"你没有该等级的装备！\n"; 
		} 
		if(n==2){
			cout<<"换成几级？(0~6)\n";
			int m;
			cin>>m;
			if(m<0||m>6) cout<<"等级不存在！\n"; 
			else if(cjia[m]>0){
				cout<<"交换成功！\n";
				cjia[jia]+=1;
				jia=m;
				cjia[m]-=1;
			}
			else cout<<"你没有该等级的装备！\n"; 
		} 
		if(n==3){
			cout<<"换成几级？(0~6)\n";
			int m;
			cin>>m;
			if(m<0||m>6) cout<<"等级不存在！\n"; 
			else if(cgua[m]>0){
				cout<<"交换成功！\n";
				cgua[gua]+=1;
				gua=m;
				cgua[m]-=1;
			}
			else cout<<"你没有该等级的装备！\n"; 
		} 
		if(n==4){
			cout<<"换成几级？(1~6)\n";
			int m;
			cin>>m;
			if(m<1||m>6) cout<<"等级不存在！\n"; 
			else if(cbao[m]>0){
				cout<<"交换成功！\n";
				cbao[bao]+=1;
				bao=m;
				cbao[m]-=1;
			}
			else cout<<"你没有该等级的装备！\n"; 
		} 
		if(n==5){
			cout<<"换成几级？(1~6)\n";
			int m;
			cin>>m;
			if(m<1||m>6) cout<<"等级不存在！\n"; 
			else if(cqiang[m]>0){
				cout<<"交换成功！\n";
				cqiang[tou]+=1;
				qiang=m;
				cqiang[m]-=1;
			}
			else cout<<"你没有该等级的装备！\n"; 
		} 
		if(n==6){
			cout<<"挂剩余格数："<<guaxnew<<"/"<<guax[gua]<<"\n";
			cout<<"将什么放入挂?1.强效注射器（占格1）2.车载急救包（占格2）3.野战急救包（占格3）4.车载医疗箱（占格4）";
			int m;
			cin>>m;
			if(m<1||m>4) cout<<"等级不存在！\n"; 
			else if(guaxnew<m) cout<<"格数不够！\n";
			else if(huixue[m]>0){
				cout<<"放入成功！\n";
				huixue[m]--;
				guazhuang[m]++;
				guaxnew-=m;
			}	
			else cout<<"你没有该等级的道具！\n"; 
		} 
	}
}
void shangdian(){
	cout<<"你要买什么？(1头2甲3挂4包5武器6道具)\n哈夫币："<<hfb<<"\n";
	int n;
	cin>>n;
	if(n==1){
		cout<<"买什么等级的？（1.5000，2.50000，3.100000，4.1000000，5.4000000，6.10000000）\n";
		int m;
		cin>>m;
		if(m<1||m>6) cout<<"数字不合法！";
		else if(hfb>=jiage[m]){
			hfb-=jiage[m];
			ctou[m]++; 
		}
		else cout<<"你没这么多钱！";
	} 
	if(n==2){
		cout<<"买什么等级的？（1.5000，2.50000，3.100000，4.1000000，5.4000000，6.10000000）\n";
		int m;
		cin>>m;
		if(m<1||m>6) cout<<"数字不合法！";
		else if(hfb>=jiage[m]){
			hfb-=jiage[m];
			cjia[m]++; 
		} 
		else cout<<"你没这么多钱！";
	} 
	if(n==3){
		cout<<"买什么等级的？（1.5000，2.50000，3.100000，4.1000000，5.4000000，6.10000000）\n";
		int m;
		cin>>m;
		if(m<1||m>6) cout<<"数字不合法！";
		else if(hfb>=jiage[m]){
			hfb-=jiage[m];
			cgua[m]++; 
		} 
		else cout<<"你没这么多钱！";
	} 
	if(n==4){
		cout<<"买什么等级的？（1.5000，2.50000，3.100000，4.1000000，5.4000000，6.10000000）\n";
		int m;
		cin>>m;
		if(m<1||m>6) cout<<"数字不合法！";
		else if(hfb>=jiage[m]){
			hfb-=jiage[m];
			cbao[m]++; 
		} 
		else cout<<"你没这么多钱！";
	} 
	if(n==5){
		cout<<"买什么等级的？（1.5000，2.50000，3.100000，4.1000000，5.4000000，6.10000000）\n";
		int m;
		cin>>m;
		if(m<1||m>6) cout<<"数字不合法！";
		else if(hfb>=jiage[m]){
			hfb-=jiage[m];
			cqiang[m]++; 
		} 
		else cout<<"你没这么多钱！";
	}
	if(n==6){
		int daoju[]={0,1000,3000,8000,15000};
		cout<<"买什么？1.强效注射器（回血3，1000）2.车载急救包（回血6，3000）3.野战急救包（回血12，8000）4.车载医疗箱（回血20,15000）\n";
		int m;
		cin>>m;
		if(m<1||m>4) cout<<"数字不合法！";
		else if(hfb>=daoju[m]){
			hfb-=daoju[m];
			huixue[m]++; 
		} 
		else cout<<"你没这么多钱！";
	}
}
int main() {
	cout << "三角洲行动小游戏\n";
	while (1) {
		chushihua();
		int n;
		cout << "哈夫币："<<hfb<<"\n";
		cout << "1.出发\n";
		cout << "2.仓库\n";
		cout << "3.商店\n";
		cin >> n;
		if (n == 1){
			int nandu;
			while(1){
				cout<<"请选择难度,最高可进入："<<nanmax<<"\n";
				cout<<"1.常规：遇到敌人概率减小，但出好东西概率也减小\n";
				cout<<"2.机密：遇到敌人概率正常，出货概率正常\n";
				cout<<"3.绝密：遇到敌人概率大增，出好东西概率也大增\n";
				cout<<"4.退出\n";
				cin>>nandu;
				if(nandu==4){
					break;
				}
				if(nandu<=nanmax){
					chufa(nandu);
					break;
				}
				else if(nandu<4) cout<<"难度不匹配！\n";
				else cout<<"无效的选项！\n";
			}
		}
		else if (n == 2)
			cangku();
		else if (n == 3)
			shangdian();
		else
			cout << "无效的操作！\n";
	}
}
