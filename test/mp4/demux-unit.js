/**
 * @file: demux-unit.js, created at Monday, 23rd December 2019 2:53:46 pm
 * @copyright Copyright (c) 2020
 * @author gem <gems.xu@gmail.com>
 */
/* eslint-env jasmine */

import Demux from '../../src/mp4/demux';
import EventEmitter from '../../src/util/event-emitter';

function flattenMp4Box(retList) {
	let ret = {};

	if (Array.isArray(retList)) {
		let prop = 'boxes';

		for (let i = 0; i < retList.length; i++) {
			let box = retList[i];
			let label = box.type;
			let stickObj = ret;
			let obj = flattenMp4Box(box[prop], prop);

			switch (box.type) {
				case 'trak':
					// A presentation consists of one or more tracks.
					stickObj = ret[obj.handlerType + 'Track'] = {};
					break;
				case 'hdlr':
					ret.handlerType = box.handlerType;
					break;
			}

			if (box.hasOwnProperty(prop)) {
				Object.assign(stickObj, obj);
			}

			if (box.type !== 'trak') {
				ret[label] = box;
			}
		}
	}

	return ret;
}

describe('MP4 Demux', () => {
	let demuxer;
	let mp4_1pic_data;
	let context = new EventEmitter();

	beforeEach(() => {
		demuxer = new Demux(context);

		// prettier-ignore
		mp4_1pic_data = new Uint8Array([
            0,0,0,32,102,116,121,112,105,115,111,109,0,0,2,0,105,115,111,109,105,115,111,50,97,118,99,49,109,112,52,49,0,0,0,8,102,114,101,101,0,0,2,212,109,100,97,116,0,0,2,174,6,5,255,255,170,220,69,233,189,230,217,72,183,150,44,216,32,217,35,238,239,120,50,54,52,32,45,32,99,111,114,101,32,49,53,53,32,114,50,57,49,55,32,48,97,56,52,100,57,56,32,45,32,72,46,50,54,52,47,77,80,69,71,45,52,32,65,86,67,32,99,111,100,101,99,32,45,32,67,111,112,121,108,101,102,116,32,50,48,
            48,51,45,50,48,49,56,32,45,32,104,116,116,112,58,47,47,119,119,119,46,118,105,100,101,111,108,97,110,46,111,114,103,47,120,50,54,52,46,104,116,109,108,32,45,32,111,112,116,105,111,110,115,58,32,99,97,98,97,99,61,49,32,114,101,102,61,51,32,100,101,98,108,111,99,107,61,49,58,48,58,48,32,97,110,97,108,121,115,101,61,48,120,51,58,48,120,49,49,51,32,109,101,61,104,101,120,32,115,117,98,109,101,61,55,32,112,115,121,61,49,32,112,115,121,95,114,100,61,49,46,48,48,
            58,48,46,48,48,32,109,105,120,101,100,95,114,101,102,61,49,32,109,101,95,114,97,110,103,101,61,49,54,32,99,104,114,111,109,97,95,109,101,61,49,32,116,114,101,108,108,105,115,61,49,32,56,120,56,100,99,116,61,49,32,99,113,109,61,48,32,100,101,97,100,122,111,110,101,61,50,49,44,49,49,32,102,97,115,116,95,112,115,107,105,112,61,49,32,99,104,114,111,109,97,95,113,112,95,111,102,102,115,101,116,61,45,50,32,116,104,114,101,97,100,115,61,49,32,108,111,111,107,97,104,
            101,97,100,95,116,104,114,101,97,100,115,61,49,32,115,108,105,99,101,100,95,116,104,114,101,97,100,115,61,48,32,110,114,61,48,32,100,101,99,105,109,97,116,101,61,49,32,105,110,116,101,114,108,97,99,101,100,61,48,32,98,108,117,114,97,121,95,99,111,109,112,97,116,61,48,32,99,111,110,115,116,114,97,105,110,101,100,95,105,110,116,114,97,61,48,32,98,102,114,97,109,101,115,61,51,32,98,95,112,121,114,97,109,105,100,61,50,32,98,95,97,100,97,112,116,61,49,32,98,95,98,
            105,97,115,61,48,32,100,105,114,101,99,116,61,49,32,119,101,105,103,104,116,98,61,49,32,111,112,101,110,95,103,111,112,61,48,32,119,101,105,103,104,116,112,61,50,32,107,101,121,105,110,116,61,50,53,48,32,107,101,121,105,110,116,95,109,105,110,61,50,53,32,115,99,101,110,101,99,117,116,61,52,48,32,105,110,116,114,97,95,114,101,102,114,101,115,104,61,48,32,114,99,95,108,111,111,107,97,104,101,97,100,61,52,48,32,114,99,61,99,114,102,32,109,98,116,114,101,101,61,
            49,32,99,114,102,61,50,51,46,48,32,113,99,111,109,112,61,48,46,54,48,32,113,112,109,105,110,61,48,32,113,112,109,97,120,61,54,57,32,113,112,115,116,101,112,61,52,32,105,112,95,114,97,116,105,111,61,49,46,52,48,32,97,113,61,49,58,49,46,48,48,0,128,0,0,0,22,101,136,132,0,87,233,215,179,8,202,214,63,155,150,189,35,178,231,33,161,41,97,0,0,3,10,109,111,111,118,0,0,0,108,109,118,104,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,232,0,0,0,34,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,2,52,116,114,97,107,0,0,0,92,116,107,104,100,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,34,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,0,0,0,0,3,142,57,0,2,0,0,0,0,0,36,101,100,116,115,0,0,0,28,101,108,115,116,0,0,0,0,0,0,0,1,0,0,0,34,0,0,0,0,0,1,0,0,0,0,1,172,109,100,105,97,
            0,0,0,32,109,100,104,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,117,48,0,0,3,233,85,196,0,0,0,0,0,54,104,100,108,114,0,0,0,0,0,0,0,0,118,105,100,101,0,0,0,0,0,0,0,0,0,0,0,0,76,45,83,77,65,83,72,32,86,105,100,101,111,32,72,97,110,100,108,101,114,0,0,0,1,78,109,105,110,102,0,0,0,20,118,109,104,100,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,36,100,105,110,102,0,0,0,28,100,114,101,102,0,0,0,0,0,0,0,1,0,0,0,12,117,114,108,32,0,0,0,1,0,0,1,14,115,116,98,108,0,0,0,170,115,116,115,100,0,0,0,
            0,0,0,0,1,0,0,0,154,97,118,99,49,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,2,0,72,0,0,0,72,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,255,255,0,0,0,52,97,118,99,67,1,100,0,10,255,225,0,27,103,100,0,10,172,217,95,158,35,255,0,8,0,9,16,0,0,62,144,0,14,166,0,241,34,89,96,1,0,6,104,235,227,203,34,192,0,0,0,16,112,97,115,112,0,0,0,8,0,0,0,9,0,0,0,24,115,116,116,115,0,0,0,0,0,0,0,1,0,0,0,1,0,0,3,233,0,0,0,28,115,
            116,115,99,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,20,115,116,115,122,0,0,0,0,0,0,2,204,0,0,0,1,0,0,0,20,115,116,99,111,0,0,0,0,0,0,0,1,0,0,0,48,0,0,0,98,117,100,116,97,0,0,0,90,109,101,116,97,0,0,0,0,0,0,0,33,104,100,108,114,0,0,0,0,0,0,0,0,109,100,105,114,97,112,112,108,0,0,0,0,0,0,0,0,0,0,0,0,45,105,108,115,116,0,0,0,37,169,116,111,111,0,0,0,29,100,97,116,97,0,0,0,1,0,0,0,0,76,97,118,102,53,56,46,50,48,46,49,48,48
        ])
	});

	describe('endStream', () => {
		it('should be exist', () => {
			expect(demuxer.endStream).not.toBeNull();
		});

		it('should be equal to demux self', () => {
			expect(demuxer.endStream).toEqual(demuxer);
		});
	});

	describe('push data to mp4 demuxer', () => {
		it('should be not null if data is correct', () => {
			let response = null;

			demuxer.on('data', (data) => {
				response = data;
			});

			// buffer -> video bytes ArrayBuffer
			demuxer.push(mp4_1pic_data);

			expect(response).not.toBeNull();
		});

		it('should return basic boxes', () => {
			let response = null;
			let containsBasicBox = false;

			demuxer.on('data', (data) => {
				response = data;
			});

			// buffer -> video bytes ArrayBuffer
			demuxer.push(mp4_1pic_data);

			if (response) {
				let flatted = flattenMp4Box(response);

				containsBasicBox = !!(flatted.ftyp && flatted.moov && flatted.mdat);
			}

			expect(containsBasicBox).toBeTrue();
		});
	});
});