/**
 * Events that can occur when any module is active (Except World. It's special.)
 **/
Events.Global = [
	{ /* The Thief */
		title: _('The Thief'),
		isAvailable: function() {
			return (Engine.activeModule == Room || Engine.activeModule == Outside) && $SM.get('game.thieves') == 1;
		},
		scenes: {
			'start': {
				text: [
					_('the villagers haul a filthy man out of the store room.'),
					_("say his folk have been skimming the supplies."),
					_('say he should be strung up as an example.')
				],
				notification: _('a thief is caught'),
				blink: true,
				buttons: {
					'kill': {
						text: _('hang him'),
						nextScene: {1: 'hang'}
					},
					'spare': {
						text: _('spare him'),
						nextScene: {1: 'spare'}
					}
				}
			},
			'hang': {
				text: [
					_('the villagers hang the thief high in front of the store room.'),
					_('the point is made. in the next few days, the missing supplies are returned.')
				],
				onLoad: function() {
					$SM.set('game.thieves', 2);
					$SM.remove('income.thieves');
					$SM.addM('stores', $SM.get('game.stolen'));
				},
				buttons: {
					'leave': {
						text: _('leave'),
						nextScene: 'end'
					}
				}
			},
			'spare': {
				text: [
					_("the man says he's grateful. says he won't come around any more."),
					_("shares what he knows about sneaking before he goes.")
				],
				onLoad: function() {
					$SM.set('game.thieves', 2);
					$SM.remove('income.thieves');
					$SM.addPerk('stealthy');
				},
				buttons: {
					'leave': {
						text: _('leave'),
						nextScene: 'end'
					}
				}
			}
		},
		audio: AudioLibrary.EVENT_THIEF
	},
	{ /* The Wounded Wanderer */
		title: _('The Wounded Wanderer'),
		isAvailable: function() {
			return (Engine.activeModule == Room || Engine.activeModule == Outside)
				&& $SM.get('stores.wood', true) >= 10
				&& !$SM.get('game.wandererEvent');
		},
		scenes: {
			'start': {
				text: [
					_('a wounded martial artist stumbles to the gate, clutching a bloodied side.'),
					_('he says he was ambushed by mountain bandits. begs for medicine and shelter.')
				],
				notification: _('a wounded wanderer seeks help'),
				blink: true,
				buttons: {
					'help': {
						text: _('offer medicine and shelter'),
						nextScene: {1: 'help'}
					},
					'turn away': {
						text: _('turn him away'),
						nextScene: {1: 'refuse'}
					}
				}
			},
			'help': {
				text: [
					_('the wanderer recovers after a few days of rest and medicine.'),
					_('before leaving, he teaches the disciples a breathing technique to endure hunger.')
				],
				onLoad: function() {
					$SM.set('game.wandererEvent', true);
					$SM.add('stores["cured meat"]', 3);
					$SM.addPerk('slow metabolism');
				},
				buttons: {
					'leave': {
						text: _('leave'),
						nextScene: 'end'
					}
				}
			},
			'refuse': {
				text: [
					_('the wanderer stumbles away into the darkness.'),
					_('some of the disciples whisper that it was an ill omen to turn away one in need.')
				],
				onLoad: function() {
					$SM.set('game.wandererEvent', true);
				},
				buttons: {
					'leave': {
						text: _('leave'),
						nextScene: 'end'
					}
				}
			}
		}
	},
	{ /* The Wandering Merchant */
		title: _('The Wandering Merchant'),
		isAvailable: function() {
			return (Engine.activeModule == Room || Engine.activeModule == Outside)
				&& $SM.get('game.buildings["trading post"]', true) > 0
				&& $SM.get('stores.fur', true) >= 50;
		},
		scenes: {
			'start': {
				text: [
					_('a traveling merchant arrives at the gate with a caravan of rare goods.'),
					_('she offers to trade rare spirit bones and monster cores for your medicinal herbs.')
				],
				notification: _('a merchant arrives with rare goods'),
				blink: true,
				buttons: {
					'buy scales': {
						text: _('trade for spirit bones'),
						onChoose: function() {
							if($SM.get('stores.fur', true) >= 50) {
								$SM.add('stores.fur', -50);
								$SM.add('stores.scales', 5);
								Notifications.notify(null, _('traded herbs for spirit bones.'));
							}
						},
						nextScene: 'end'
					},
					'buy teeth': {
						text: _('trade for monster cores'),
						onChoose: function() {
							if($SM.get('stores.fur', true) >= 80) {
								$SM.add('stores.fur', -80);
								$SM.add('stores.teeth', 5);
								Notifications.notify(null, _('traded herbs for monster cores.'));
							}
						},
						nextScene: 'end'
					},
					'decline': {
						text: _('politely decline'),
						nextScene: 'end'
					}
				}
			}
		}
	},
	{ /* The Challenger */
		title: _('The Challenger'),
		isAvailable: function() {
			return Engine.activeModule == Outside
				&& $SM.get('game.buildings["workshop"]', true) > 0
				&& $SM.get('stores["iron sword"]', true) >= 1
				&& !$SM.get('game.challengerEvent');
		},
		scenes: {
			'start': {
				text: [
					_('a sword-wielding stranger stands at the gate, demanding a duel.'),
					_('defeat will bring shame, but victory will spread the sect\'s fame.')
				],
				notification: _('a challenger demands a duel'),
				blink: true,
				buttons: {
					'accept': {
						text: _('accept the challenge'),
						nextScene: {1: 'accept'}
					},
					'decline': {
						text: _('decline the duel'),
						nextScene: {1: 'decline'}
					}
				}
			},
			'accept': {
				text: [
					_('the duel is fierce but brief. the challenger acknowledges defeat with a bow.'),
					_('word of the victory spreads, attracting more disciples to the sect.')
				],
				onLoad: function() {
					$SM.set('game.challengerEvent', true);
					$SM.add('stores.fur', 20);
					$SM.add('stores.wood', 50);
				},
				buttons: {
					'leave': {
						text: _('leave'),
						nextScene: 'end'
					}
				}
			},
			'decline': {
				text: [
					_('the challenger scoffs and leaves, spreading word of the sect\'s cowardice.'),
					_('some disciples seem disappointed.')
				],
				onLoad: function() {
					$SM.set('game.challengerEvent', true);
				},
				buttons: {
					'leave': {
						text: _('leave'),
						nextScene: 'end'
					}
				}
			}
		}
	},
	{ /* The Bandit Raid */
		title: _('The Bandit Raid'),
		isAvailable: function() {
			return Engine.activeModule == Outside
				&& $SM.get('game.population', true) >= 4
				&& $SM.get('game.buildings["trap"]', true) < 3
				&& !$SM.get('game.banditEvent');
		},
		scenes: {
			'start': {
				text: [
					_('a band of mountain bandits descends upon the sect at dusk.'),
					_('the disciples scramble, but the defenses are too weak to stop them.')
				],
				notification: _('bandits are raiding the sect!'),
				blink: true,
				buttons: {
					'fight': {
						text: _('fight them off'),
						nextScene: {1: 'fight'}
					},
					'pay': {
						text: _('pay them off'),
						nextScene: {1: 'pay'}
					}
				}
			},
			'fight': {
				text: [
					_('the disciples fight bravely, driving the bandits back into the mountains.'),
					_('the sect\'s reputation for courage grows.')
				],
				onLoad: function() {
					$SM.set('game.banditEvent', true);
					$SM.add('stores.fur', 10);
					$SM.add('stores.wood', 20);
				},
				buttons: {
					'leave': {
						text: _('leave'),
						nextScene: 'end'
					}
				}
			},
			'pay': {
				text: [
					_('the bandits take the silver and leave, laughing.'),
					_('the disciples look at the ground in shame.')
				],
				onLoad: function() {
					$SM.set('game.banditEvent', true);
					$SM.add('stores.wood', -30);
				},
				buttons: {
					'leave': {
						text: _('leave'),
						nextScene: 'end'
					}
				}
			}
		}
	},
	{ /* The Hermit Master */
		title: _('The Hermit Master'),
		isAvailable: function() {
			return (Engine.activeModule == Room || Engine.activeModule == Outside)
				&& $SM.get('stores.wood', true) >= 200
				&& !$SM.hasPerk('precise')
				&& !$SM.get('game.hermitEvent');
		},
		scenes: {
			'start': {
				text: [
					_('an old hermit appears at the sect gate, leaning on a wooden staff.'),
					_('he says he has watched the sect grow and offers to share his sword technique.')
				],
				notification: _('a hermit master offers guidance'),
				blink: true,
				buttons: {
					'learn': {
						text: _('learn the technique'),
						nextScene: {1: 'learn'},
						onChoose: function() {
							$SM.add('stores.wood', -100);
						}
					},
					'decline': {
						text: _('politely decline'),
						nextScene: 'end'
					}
				}
			},
			'learn': {
				text: [
					_('the hermit demonstrates a sword form of breathtaking precision.'),
					_('the disciples watch in awe as he cuts a falling leaf mid-air.'),
					_('after a week of training, their strikes land truer than ever before.')
				],
				onLoad: function() {
					$SM.set('game.hermitEvent', true);
					$SM.addPerk('precise');
				},

				buttons: {
					'leave': {
						text: _('leave'),
						nextScene: 'end'
					}
				}
			}
		}
	},
	{ /* The Beast Sighting */
		title: _('The Beast Sighting'),
		isAvailable: function() {
			return Engine.activeModule == Outside
				&& $SM.get('game.buildings["trap"]', true) >= 2
				&& !$SM.get('game.beastEvent');
		},
		scenes: {
			'start': {
				text: [
					_('disciples report a large beast prowling near the sect grounds.'),
					_('its tracks are unlike anything seen before.')
				],
				notification: _('a strange beast has been sighted'),
				blink: true,
				buttons: {
					'hunt': {
						text: _('organize a hunt'),
						nextScene: {0.4: 'success', 1: 'fail'}
					},
					'ignore': {
						text: _('leave it be'),
						nextScene: 'end'
					}
				}
			},
			'success': {
				text: [
					_('the hunting party returns victorious, dragging the beast\'s carcass.'),
					_('its scales and teeth will make fine crafting materials.')
				],
				onLoad: function() {
					$SM.set('game.beastEvent', true);
					$SM.add('stores.scales', 5);
					$SM.add('stores.teeth', 5);
					$SM.add('stores.fur', 20);
				},
				buttons: {
					'leave': {
						text: _('leave'),
						nextScene: 'end'
					}
				}
			},
			'fail': {
				text: [
					_('the beast eludes the hunting party, leaving only deep claw marks on ancient trees.'),
					_('the disciples return empty-handed but unharmed.')
				],
				onLoad: function() {
					$SM.set('game.beastEvent', true);
				},
				buttons: {
					'leave': {
						text: _('leave'),
						nextScene: 'end'
					}
				}
			}
		}
	},
	{ /* The Tournament Invitation */
		title: _('The Tournament Invitation'),
		isAvailable: function() {
			return Engine.activeModule == Outside
				&& $SM.get('game.population', true) >= 8
				&& $SM.get('stores["iron sword"]', true) >= 3
				&& !$SM.get('game.tournamentEvent');
		},
		scenes: {
			'start': {
				text: [
					_('a messenger arrives with an invitation to the annual martial arts tournament.'),
					_('participation would bring great honor, but requires sending three of the best disciples.')
				],
				notification: _('an invitation to the martial tournament arrives'),
				blink: true,
				buttons: {
					'send': {
						text: _('send disciples'),
						nextScene: {0.5: 'victory', 1: 'defeat'}
					},
					'decline': {
						text: _('decline the invitation'),
						nextScene: 'end'
					}
				}
			},
			'victory': {
				text: [
					_('the disciples return triumphant, bearing trophies and prizes.'),
					_('the sect\'s name far and wide across the jianghu.')
				],
				onLoad: function() {
					$SM.set('game.tournamentEvent', true);
					$SM.add('stores.wood', 200);
					$SM.add('stores.fur', 100);
					$SM.add('stores.scales', 10);
				},
				buttons: {
					'leave': {
						text: _('leave'),
						nextScene: 'end'
					}
				}
			},
			'defeat': {
				text: [
					_('the disciples fought well but were outmatched.'),
					_('they return with new resolve to train harder.')
				],
				onLoad: function() {
					$SM.set('game.tournamentEvent', true);
					$SM.add('stores.wood', 50);
				},

				buttons: {
					'leave': {
						text: _('leave'),
						nextScene: 'end'
					}
				}
			}
		}
	},
	{ /* The Ancient Manual */
		title: _('The Ancient Manual'),
		isAvailable: function() {
			return Engine.activeModule == Room
				&& $SM.get('stores.wood', true) >= 300
				&& $SM.get('game.buildings["workshop"]', true) > 0
				&& !$SM.hasPerk('barbarian')
				&& !$SM.get('game.manualEvent');
		},
		scenes: {
			'start': {
				text: [
					_('while cleaning the storeroom, a disciple finds an ancient martial manual hidden behind a loose brick.'),
					_('the pages are yellowed but the diagrams are still clear.')
				],
				notification: _('an ancient martial manual has been discovered'),
				blink: true,
				buttons: {
					'study': {
						text: _('study the manual'),
						nextScene: {0.4: 'master', 1: 'partial'}
					},
					'sell': {
						text: _('sell it to a collector'),
						nextScene: {1: 'sell'}
					}
				}
			},
			'master': {
				text: [
					_('the manual describes a powerful sword technique.'),
					_('after weeks of practice, the disciples\' combat ability improves dramatically.')
				],
				onLoad: function() {
					$SM.set('game.manualEvent', true);
					$SM.addPerk('barbarian');
				},
				buttons: {
					'leave': {
						text: _('leave'),
						nextScene: 'end'
					}
				}
			},
			'partial': {
				text: [
					_('the manual is damaged and only fragments can be deciphered.'),
					_('still, even these fragments improve the disciples\' techniques.')
				],
				onLoad: function() {
					$SM.set('game.manualEvent', true);
					$SM.add('stores.fur', 50);
				},
				buttons: {
					'leave': {
						text: _('leave'),
						nextScene: 'end'
					}
				}
			},
			'sell': {
				text: [
					_('a wealthy collector pays handsomely for the ancient text.'),
					_('the sect\'s treasury grows, but some disciples wonder what secrets were lost.')
				],
				onLoad: function() {
					$SM.set('game.manualEvent', true);
					$SM.add('stores.wood', 500);
				},
				buttons: {
					'leave': {
						text: _('leave'),
						nextScene: 'end'
					}
				}
			}
		}
	},
	{ /* The Refugee Wave */
		title: _('The Refugee Wave'),
		isAvailable: function() {
			return Engine.activeModule == Outside
				&& $SM.get('game.population', true) >= 6
				&& $SM.get('stores["cured meat"]', true) >= 20
				&& !$SM.get('game.refugeeEvent');
		},
		scenes: {
			'start': {
				text: [
					_('a large group of refugees arrives at the sect gate, fleeing from war in the north.'),
					_('they beg for shelter and food, promising to work in return.')
				],
				notification: _('refugees arrive seeking shelter'),
				blink: true,
				buttons: {
					'accept': {
						text: _('take them in'),
						nextScene: {1: 'accept'}
					},
					'partial': {
						text: _('give food but turn them away'),
						nextScene: {1: 'partial'}
					}
				}
			},
			'accept': {
				text: [
					_('the refugees are grateful and immediately set to work.'),
					_('the sect gains many new disciples and a reputation for compassion.')
				],
				onLoad: function() {
					$SM.set('game.refugeeEvent', true);
					$SM.add('stores.wood', 100);
					$SM.add('stores["cured meat"]', -10);
				},
				buttons: {
					'leave': {
						text: _('leave'),
						nextScene: 'end'
					}
				}
			},
			'partial': {
				text: [
					_('the refugees take the food with gratitude and continue their journey.'),
					_('some disciples feel the sect could have done more.')
				],
				onLoad: function() {
					$SM.set('game.refugeeEvent', true);
					$SM.add('stores["cured meat"]', -5);
				},
				buttons: {
					'leave': {
						text: _('leave'),
						nextScene: 'end'
					}
				}
			}
		}
	}
];
