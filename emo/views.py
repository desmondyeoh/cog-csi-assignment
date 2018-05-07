from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from base64 import b64encode
from emo.models import Session_data

import Algorithmia
import json	
import time
import threading


# @require_http_methods(["GET", "POST"])
@csrf_exempt
def init_sess(request):

	if request.body:

		
		js = json.loads(request.body)
		sess_id = js['id']
		spp = js['ss']
		total_img = js['tt']
		usr_data = {str(k): [] for k in range(total_img)}
		usr_data = json.dumps(usr_data)

		q = Session_data(
				session_id = sess_id,
				usr_data = usr_data,
				total_img = total_img,
				spp = spp,
				lock = 0
			)
		q.save()

	return HttpResponse('200')


def api_call(sess_id, data, label):
	try:
		client = Algorithmia.client("simJoaETq5SHL8t3YIU19pWMfLr1")
		algo = client.algo('deeplearning/EmotionRecognitionCNNMBP/1.0.1')
		result = algo.pipe(data).result
		result = result["results"][0]["emotions"]
		# result = [{'confidence': 0.1, 'label': 'Neutral'},
		# 		  {'confidence': 0.7, 'label': 'Disgust'},
		# 		  {'confidence': 0, 'label': 'Surprise'},
		# 		  {'confidence': 0, 'label': 'Sad'},
		# 		  {'confidence': 0, 'label': 'Fear'},
		# 		  {'confidence': 0, 'label': 'Happy'},
		# 		  {'confidence': 0, 'label': 'Angry'}]
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

	
	q = Session_data.objects.get(pk=sess_id)
	while q.lock:
		q = Session_data.objects.get(pk=sess_id)
		time.sleep(1 / 10)
	q.lock = 1
	q.save()
	usr_data = json.loads(q.usr_data)
	usr_data[label].append(score)
	q.usr_data = json.dumps(usr_data)
	q.lock = 0
	q.save()


# @require_http_methods(["GET", "POST"])
@csrf_exempt
def upload_img(request):
	
	if request.body:

		js = json.loads(request.body)
		
		sess_id = js['ses']

		spp = js['spp']
		img = js['img']
		label = str(js['lbl'] // spp)

		data = { 
			  "image": img
			, "numResults": 7
		}
		# try:
		# 	client = Algorithmia.client("simJoaETq5SHL8t3YIU19pWMfLr1")
		# 	algo = client.algo('deeplearning/EmotionRecognitionCNNMBP/1.0.1')
		# 	result = algo.pipe(data).result
		# 	result = result["results"][0]["emotions"]
		# 	# result = [{'confidence': 0.1, 'label': 'Neutral'},
		# 	# 		  {'confidence': 0.7, 'label': 'Disgust'},
		# 	# 		  {'confidence': 0, 'label': 'Surprise'},
		# 	# 		  {'confidence': 0, 'label': 'Sad'},
		# 	# 		  {'confidence': 0, 'label': 'Fear'},
		# 	# 		  {'confidence': 0, 'label': 'Happy'},
		# 	# 		  {'confidence': 0, 'label': 'Angry'}]
		# 	print('Food {}'.format(label))
		# 	print('\n'.join(['{}'.format(str(k)) for k in result]))

		# except:
		# 	result = [{'confidence': 0, 'label': 'Neutral'},
		# 			  {'confidence': 0, 'label': 'Disgust'},
		# 			  {'confidence': 0, 'label': 'Surprise'},
		# 			  {'confidence': 0, 'label': 'Sad'},
		# 			  {'confidence': 0, 'label': 'Fear'},
		# 			  {'confidence': 0, 'label': 'Happy'},
		# 			  {'confidence': 0, 'label': 'Angry'}]
		
		# score = cal_score(result)

		
		# q = Session_data.objects.get(pk=sess_id)
		# while q.lock:
		# 	q = Session_data.objects.get(pk=sess_id)
		# 	time.sleep(1 / 10)
		# q.lock = 1
		# q.save()
		# usr_data = json.loads(q.usr_data)
		# usr_data[label].append(score)
		# q.usr_data = json.dumps(usr_data)
		# q.lock = 0
		# q.save()
		while threading.active_count() > 8:
			time.sleep(1/ 10)
		t = threading.Thread(target=api_call, args=(sess_id, data, label, ), daemon=True)
		t.start()
		# t.join()

	return HttpResponse('200')


@csrf_exempt
def get_res(request):

	if request.body:
		
		sess_id = json.loads(request.body)['id']
		
		q = Session_data.objects.get(pk=sess_id)
		
		usr_data = json.loads(q.usr_data)
		total_img = q.total_img
		spp = q.spp
			
		sum_of_pics = sum([len(usr_data[k]) for k in usr_data])
		# start = time.time()
		# dur = 0
		# while sum_of_pics < total_img * spp and dur < 25:
		# 	q = Session_data.objects.get(pk=sess_id)
			
		# 	usr_data = json.loads(q.usr_data)
		# 	sum_of_pics = sum([len(usr_data[k]) for k in usr_data])
		# 	dur = time.time() - start
		# 	time.sleep(1 / 10)
		if sum_of_pics < total_img * spp:
			print(sum_of_pics, usr_data)
			return HttpResponse(json.dumps({'result': []}))
			
	
		final_score = {}
		usr_data
		for k, v in usr_data.items():
			final_score[k] = sum(v) / len(v)

		result = sorted(final_score, key=lambda k: -final_score[k])
		q.delete()
		print(result, Session_data.objects.all())
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