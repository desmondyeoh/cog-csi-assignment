from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from base64 import b64encode

import Algorithmia
import json	
import time

global usr_data
total_img = {}
spp = 1

# @require_http_methods(["GET", "POST"])
@csrf_exempt
def init_sess(request):
	global usr_data, spp

	if request.body:
		usr_data = {}
		# return HttpResponse('200')
		js = json.loads(request.body)
		sess_id = js['id']
		spp = js['ss']
		t_img = js['tt']

		usr_data[sess_id] = {}
		total_img[sess_id] = t_img

		print(usr_data)

	return HttpResponse('200')


# @require_http_methods(["GET", "POST"])
@csrf_exempt
def upload_img(request):
	global usr_data, spp
	
	if request.body:
		js = json.loads(request.body)
		
		sess_id = js['ses']
		print(sess_id, usr_data)
		return HttpResponse('200')

		img = js['img']
		# print(img[:10], img[-10:])
		# return HttpResponse('200')
		label = js['lbl'] // spp

		data = { 
			  "image": img
			, "numResults": 7
		}
		try:
			# client = Algorithmia.client("simJoaETq5SHL8t3YIU19pWMfLr1")
			# algo = client.algo('deeplearning/EmotionRecognitionCNNMBP/1.0.1')
			# result = algo.pipe(data).result
			# result = result["results"][0]["emotions"]
			result = [{'confidence': 0.1, 'label': 'Neutral'},
					  {'confidence': 0.7, 'label': 'Disgust'},
					  {'confidence': 0, 'label': 'Surprise'},
					  {'confidence': 0, 'label': 'Sad'},
					  {'confidence': 0, 'label': 'Fear'},
					  {'confidence': 0, 'label': 'Happy'},
					  {'confidence': 0, 'label': 'Angry'}]
			print('Food {}'.format(label))
			print('\n'.join(['{}'.format(str(k)) for k in result]))

		except:
			result = [{'confidence': 0, 'label': 'Neutral'},
					  {'confidence': 0, 'label': 'Disgust'},
					  {'confidence': 0, 'label': 'Surprise'},
					  {'confidence': 0, 'label': 'Sad'},
					  {'confidence': 0, 'label': 'Fear'},
					  {'confidence': 0, 'label': 'Happy'},
					  {'confidence': 0, 'label': 'Angry'}]
		
		score = cal_score(result)
		if not label in usr_data[sess_id].keys():
			usr_data[sess_id][label] = [score]
		else:
			usr_data[sess_id][label].append(score)

	return HttpResponse('200')


@csrf_exempt
def get_res(request):
	global usr_data, spp

	if request.body:
		print(usr_data)
		return HttpResponse('200')
		sess_id = json.loads(request.body)['id']

		while len(usr_data[sess_id]) < total_img[sess_id]:
			time.sleep(1 / 10)
		while len(usr_data[sess_id][total_img[sess_id] - 1]) < spp:
			time.sleep(1 / 10)

		final_score = {}
		usr_data
		for k, v in usr_data[sess_id].items():
			final_score[k] = sum(v) / len(v)

		result = sorted(final_score, key=lambda k: -final_score[k])
		print(result, usr_data[sess_id])
		usr_data[sess_id] = None
		return HttpResponse(json.dumps({'result': result}))

	return HttpResponse('200')


def cal_score(prob_matrix):
	pos = {'Happy': 3, 'Surprise': 2, 'Neutral': 1}
	neg = {'Sad': -1, 'Fear': -2, 'Angry': -3, 'Disgust': -4}
	
	score = [0, 0]
	for k in prob_matrix:
		if k['label'] in pos.keys():
			score[0] += k['confidence'] * pos[k['label']]
		else:
			score[1] += k['confidence'] * neg[k['label']]
	score = (sum([score[0] / sum(pos.values()), score[1] / -sum(neg.values())]) + 1) / 2
	return score